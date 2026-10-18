/**
 * Minimal QR Code encoder (ISO/IEC 18004): byte mode, ECC level L or M,
 * versions 1–40, automatic mask selection. Dependency-free so the teacher's
 * "join from another device" panel never ships the room password to a
 * third-party image API.
 *
 * Structure follows the well-known reference algorithm (function patterns →
 * data + Reed-Solomon ECC interleaving → zig-zag placement → mask → format
 * bits). Output is a square boolean matrix (true = dark module).
 */

export type QrMatrix = boolean[][];
export type QrEcc = 'L' | 'M';

const ECC_INDEX: Record<QrEcc, number> = { L: 0, M: 1 };
const ECC_FORMAT_BITS: Record<QrEcc, number> = { L: 1, M: 0 };

const ECC_CODEWORDS_PER_BLOCK: number[][] = [
    [7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
];
const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
    [1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
];

function numRawDataModules(ver: number): number {
    let result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
        const numAlign = Math.floor(ver / 7) + 2;
        result -= (25 * numAlign - 10) * numAlign - 55;
        if (ver >= 7) result -= 36;
    }
    return result;
}

function numDataCodewords(ver: number, ecc: number): number {
    return Math.floor(numRawDataModules(ver) / 8)
        - ECC_CODEWORDS_PER_BLOCK[ecc][ver - 1] * NUM_ERROR_CORRECTION_BLOCKS[ecc][ver - 1];
}

// ── GF(256) Reed–Solomon ────────────────────────────────────────────────────

function gfMul(x: number, y: number): number {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
        z = (z << 1) ^ ((z >>> 7) * 0x11d);
        z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xff;
}

function rsDivisor(degree: number): number[] {
    const result: number[] = new Array(degree).fill(0);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
        for (let j = 0; j < degree; j++) {
            result[j] = gfMul(result[j], root);
            if (j + 1 < degree) result[j] ^= result[j + 1];
        }
        root = gfMul(root, 0x02);
    }
    return result;
}

function rsRemainder(data: number[], divisor: number[]): number[] {
    const result: number[] = divisor.map(() => 0);
    for (const b of data) {
        const factor = b ^ (result.shift() as number);
        result.push(0);
        divisor.forEach((coef, i) => {
            result[i] ^= gfMul(coef, factor);
        });
    }
    return result;
}

// ── Bit helpers ─────────────────────────────────────────────────────────────

function appendBits(val: number, len: number, bits: number[]): void {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
}

function getBit(x: number, i: number): boolean {
    return ((x >>> i) & 1) !== 0;
}

// ── Encoder ─────────────────────────────────────────────────────────────────

export function encodeQr(text: string, eccLevel: QrEcc = 'M'): QrMatrix {
    const ecc = ECC_INDEX[eccLevel];
    const bytes = Array.from(new TextEncoder().encode(text));

    let ver = 1;
    for (; ver <= 40; ver++) {
        const ccBits = ver <= 9 ? 8 : 16;
        if (4 + ccBits + bytes.length * 8 <= numDataCodewords(ver, ecc) * 8) break;
    }
    if (ver > 40) throw new Error('QR: data too long');

    const ccBits = ver <= 9 ? 8 : 16;
    const capacityBits = numDataCodewords(ver, ecc) * 8;
    const bits: number[] = [];
    appendBits(0b0100, 4, bits);
    appendBits(bytes.length, ccBits, bits);
    for (const b of bytes) appendBits(b, 8, bits);
    appendBits(0, Math.min(4, capacityBits - bits.length), bits);
    appendBits(0, (8 - (bits.length % 8)) % 8, bits);
    for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) appendBits(pad, 8, bits);

    const dataCodewords: number[] = new Array(bits.length / 8).fill(0);
    bits.forEach((b, i) => {
        dataCodewords[i >>> 3] |= b << (7 - (i & 7));
    });

    return buildMatrix(ver, ecc, eccLevel, dataCodewords);
}

function buildMatrix(ver: number, ecc: number, eccLevel: QrEcc, dataCodewords: number[]): QrMatrix {
    const size = ver * 4 + 17;
    const modules: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
    const isFunction: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

    const setFn = (x: number, y: number, dark: boolean) => {
        modules[y][x] = dark;
        isFunction[y][x] = true;
    };

    const drawFinder = (x: number, y: number) => {
        for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const dist = Math.max(Math.abs(dx), Math.abs(dy));
                const xx = x + dx;
                const yy = y + dy;
                if (xx >= 0 && xx < size && yy >= 0 && yy < size) setFn(xx, yy, dist !== 2 && dist !== 4);
            }
        }
    };

    const drawAlign = (x: number, y: number) => {
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) setFn(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
    };

    const alignmentPositions = (): number[] => {
        if (ver === 1) return [];
        const numAlign = Math.floor(ver / 7) + 2;
        const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
        const result = [6];
        for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
        return result;
    };

    const drawFormatBits = (mask: number) => {
        const data = (ECC_FORMAT_BITS[eccLevel] << 3) | mask;
        let rem = data;
        for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
        const bits = ((data << 10) | rem) ^ 0x5412;

        for (let i = 0; i <= 5; i++) setFn(8, i, getBit(bits, i));
        setFn(8, 7, getBit(bits, 6));
        setFn(8, 8, getBit(bits, 7));
        setFn(7, 8, getBit(bits, 8));
        for (let i = 9; i < 15; i++) setFn(14 - i, 8, getBit(bits, i));

        for (let i = 0; i < 8; i++) setFn(size - 1 - i, 8, getBit(bits, i));
        for (let i = 8; i < 15; i++) setFn(8, size - 15 + i, getBit(bits, i));
        setFn(8, size - 8, true);
    };

    const drawVersion = () => {
        if (ver < 7) return;
        let rem = ver;
        for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
        const bits = (ver << 12) | rem;
        for (let i = 0; i < 18; i++) {
            const bit = getBit(bits, i);
            const a = size - 11 + (i % 3);
            const b = Math.floor(i / 3);
            setFn(a, b, bit);
            setFn(b, a, bit);
        }
    };

    // Function patterns
    for (let i = 0; i < size; i++) {
        setFn(6, i, i % 2 === 0);
        setFn(i, 6, i % 2 === 0);
    }
    drawFinder(3, 3);
    drawFinder(size - 4, 3);
    drawFinder(3, size - 4);
    const align = alignmentPositions();
    const n = align.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const corner = (i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0);
            if (!corner) drawAlign(align[i], align[j]);
        }
    }
    drawFormatBits(0);
    drawVersion();

    // ECC + interleave
    const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecc][ver - 1];
    const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecc][ver - 1];
    const rawCodewords = Math.floor(numRawDataModules(ver) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);

    const blocks: number[][] = [];
    const divisor = rsDivisor(blockEccLen);
    for (let i = 0, k = 0; i < numBlocks; i++) {
        const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
        const dat = dataCodewords.slice(k, k + datLen);
        k += datLen;
        const eccPart = rsRemainder(dat, divisor);
        if (i < numShortBlocks) dat.push(0);
        blocks.push(dat.concat(eccPart));
    }
    const allCodewords: number[] = [];
    for (let i = 0; i < blocks[0].length; i++) {
        blocks.forEach((block, j) => {
            if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) allCodewords.push(block[i]);
        });
    }

    // Zig-zag placement
    let bitIndex = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < size; vert++) {
            for (let j = 0; j < 2; j++) {
                const x = right - j;
                const upward = ((right + 1) & 2) === 0;
                const y = upward ? size - 1 - vert : vert;
                if (!isFunction[y][x] && bitIndex < allCodewords.length * 8) {
                    modules[y][x] = getBit(allCodewords[bitIndex >>> 3], 7 - (bitIndex & 7));
                    bitIndex++;
                }
            }
        }
    }

    // Masking
    const applyMask = (mask: number) => {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let invert = false;
                switch (mask) {
                    case 0: invert = (x + y) % 2 === 0; break;
                    case 1: invert = y % 2 === 0; break;
                    case 2: invert = x % 3 === 0; break;
                    case 3: invert = (x + y) % 3 === 0; break;
                    case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
                    case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
                    case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
                    default: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
                }
                if (!isFunction[y][x] && invert) modules[y][x] = !modules[y][x];
            }
        }
    };

    const penalty = (): number => {
        let score = 0;
        const runPenalty = (line: boolean[]) => {
            let run = 1;
            for (let i = 1; i <= line.length; i++) {
                if (i < line.length && line[i] === line[i - 1]) {
                    run++;
                } else {
                    if (run >= 5) score += 3 + (run - 5);
                    run = 1;
                }
            }
            // Finder-like 1:1:3:1:1 pattern with 4 light modules on one side.
            const pattern = [true, false, true, true, true, false, true];
            for (let i = 0; i + 7 <= line.length; i++) {
                let match = true;
                for (let k = 0; k < 7; k++) if (line[i + k] !== pattern[k]) { match = false; break; }
                if (!match) continue;
                const lightBefore = i >= 4 && line.slice(i - 4, i).every(v => !v);
                const lightAfter = i + 11 <= line.length && line.slice(i + 7, i + 11).every(v => !v);
                if (lightBefore || lightAfter) score += 40;
            }
        };
        for (let y = 0; y < size; y++) runPenalty(modules[y]);
        for (let x = 0; x < size; x++) runPenalty(modules.map(row => row[x]));
        for (let y = 0; y + 1 < size; y++) {
            for (let x = 0; x + 1 < size; x++) {
                const c = modules[y][x];
                if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) score += 3;
            }
        }
        let dark = 0;
        for (const row of modules) for (const m of row) if (m) dark++;
        const total = size * size;
        const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
        score += 10 * k;
        return score;
    };

    let bestMask = 0;
    let bestScore = Infinity;
    for (let m = 0; m < 8; m++) {
        applyMask(m);
        drawFormatBits(m);
        const s = penalty();
        if (s < bestScore) {
            bestScore = s;
            bestMask = m;
        }
        applyMask(m); // undo (XOR is its own inverse)
    }
    applyMask(bestMask);
    drawFormatBits(bestMask);

    return modules;
}

/** SVG path data ("M x y h1 v1 h-1 z …") for the dark modules. */
export function qrToSvgPath(matrix: QrMatrix): string {
    const parts: string[] = [];
    matrix.forEach((row, y) => {
        row.forEach((dark, x) => {
            if (dark) parts.push(`M${x} ${y}h1v1h-1z`);
        });
    });
    return parts.join('');
}
