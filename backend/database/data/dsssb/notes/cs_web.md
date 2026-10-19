# Web Technologies: DSSSB TGT CS Revision Notes

## 1. One-page summary

- Expect about 6-9 questions from Web Technologies. The bulk is HTML (tags, attributes, forms, tables, lists) and CSS (selectors, box model), followed by JavaScript basics and "what is the output / what renders" snippets.
- Also asked: HTTP methods and status codes, client–server terms, e-commerce models (B2B, B2C, C2C, C2B, B2G), web attacks (XSS, SQL injection, CSRF), and XML/JSON syntax rules.
- For output questions: read every tag or operator literally. HTML collapses spaces; `+` with a string concatenates; `sort()` is alphabetical by default; the later CSS rule wins only when specificity is equal.
- Key people: Tim Berners-Lee (WWW, HTML, HTTP, 1989-91), Håkon Wium Lie (proposed CSS, 1994), Brendan Eich (JavaScript, 1995). W3C standardises HTML/CSS/XML; JavaScript is standardised as ECMAScript by Ecma International.

## 2. HTML tags and attributes

| Tag | Purpose | Note |
|---|---|---|
| `<!DOCTYPE html>` | Declares HTML5 | Not a tag; must be first line |
| `<head>`, `<title>`, `<meta>` | Page metadata | `<title>` text shows in the browser tab |
| `<h1>`…`<h6>` | Headings | `<h1>` largest, `<h6>` smallest |
| `<p>`, `<br>`, `<hr>` | Paragraph, line break, horizontal rule | `<br>`, `<hr>` are void (no closing tag) |
| `<a href target>` | Hyperlink | `target="_blank"` opens a new tab; `mailto:` for e-mail |
| `<img src alt width height>` | Image | `alt` = alternative text (accessibility) |
| `<strong>`, `<em>` | Semantic importance/emphasis | `<b>`, `<i>` are only presentational |
| `<sub>`, `<sup>` | Subscript, superscript | H<sub>2</sub>O, x<sup>2</sup> |
| `<pre>` | Preformatted text | Keeps spaces and line breaks |
| `<div>` / `<span>` | Generic block / inline container | Used with CSS |
| `<iframe src>` | Embed another page | |
| `<audio>`, `<video>`, `<canvas>` | HTML5 media and drawing | `controls` attribute shows player buttons |
| `<header>`, `<nav>`, `<section>`, `<article>`, `<aside>`, `<footer>` | HTML5 semantic layout | `<nav>` = navigation links |

- Void elements: `<br>`, `<hr>`, `<img>`, `<input>`, `<meta>`, `<link>`.
- Block-level: `<div>`, `<p>`, `<h1>`-`<h6>`, `<ul>`, `<table>`, `<form>`. Inline: `<span>`, `<a>`, `<img>`, `<b>`, `<em>`, `<input>`.
- Entities: `&lt;` <, `&gt;` >, `&amp;` &, `&nbsp;` non-breaking space, `&copy;` ©.
- Whitespace: multiple spaces and newlines collapse into one space (except inside `<pre>`).
- Obsolete in HTML5: `<font>`, `<center>`, `<marquee>`, `<big>`, `<frame>`.

## 3. HTML forms

- `<form action="url" method="get|post">`: `action` = where data goes; `method` = how. GET puts data in the URL (visible, limited, bookmarkable); POST sends it in the request body (better for passwords, files, large data). File upload needs `method="post"` and `enctype="multipart/form-data"`.
- `<input type=…>`: text, password (masked), email, number, date, radio, checkbox, file, hidden, submit, reset, button, range, color.
- Radio buttons in one group share the same `name`; checkboxes allow many selections.
- `<select>` with `<option>` gives a drop-down; add `multiple` for multi-select. `<textarea rows cols>` for multi-line text. `<label for="id">` links to a control's `id`.
- HTML5 attributes: `required`, `placeholder`, `autofocus`, `pattern`, `min`/`max`.
- `readonly` fields are submitted; `disabled` fields are NOT submitted.

## 4. Tables and lists

- `<table>` → `<tr>` (row) → `<th>` (header cell, bold and centred) / `<td>` (data cell). Groups: `<thead>`, `<tbody>`, `<tfoot>`; title: `<caption>`.
- `colspan` merges across columns; `rowspan` merges down rows. A spanned cell is still ONE `<td>`.
- `cellpadding` = space inside a cell; `cellspacing` = gap between cells (CSS: `padding`, `border-spacing`).
- `<ul>` unordered (bullets: disc, circle, square), `<ol>` ordered (`type` = 1, A, a, I, i; `start` always a number; `reversed`), `<dl>` description list with `<dt>` term and `<dd>` description. `<li>` is the item in `<ul>`/`<ol>`.

## 5. CSS selectors

Three ways to add CSS: inline (`style="…"`), internal (`<style>` in head), external (`<link rel="stylesheet" href="style.css">`). Priority: inline > internal/external (whichever comes later) when specificity is equal; `!important` overrides normal rules.

| Selector | Example | Selects |
|---|---|---|
| Universal | `*` | Every element |
| Type | `p` | All `<p>` |
| Class | `.note` | Elements with class="note" |
| ID | `#header` | The element with id="header" |
| Group | `h1, h2` | Both h1 and h2 |
| Descendant | `div p` | p anywhere inside div |
| Child | `div > p` | p that is a direct child of div |
| Adjacent sibling | `h1 + p` | First p immediately after h1 |
| General sibling | `h1 ~ p` | All p siblings after h1 |
| Attribute | `input[type="text"]` | Inputs whose type is text |
| Pseudo-class | `a:hover`, `li:nth-child(2n)`, `:first-child` | State or position |
| Pseudo-element | `p::first-letter`, `::before`, `::after` | Part of an element |

**Specificity** (a, b, c) = (IDs, classes/attributes/pseudo-classes, elements/pseudo-elements). Inline style beats all; then ID > class > type. Equal specificity → the rule written later wins. The order of names inside `class="b a"` does not matter.

## 6. CSS properties and box model

- Box model from inside out: content → padding → border → margin. With `box-sizing: content-box` (default), visible width = width + 2×padding + 2×border. With `border-box`, the declared width already includes padding and border.
- Shorthand: `margin: 10px` (all), `10px 20px` (top/bottom, left/right), `10px 20px 30px` (top, left/right, bottom), `10px 20px 30px 40px` (top, right, bottom, left — clockwise).
- `position`: static (default), relative (offset from normal position), absolute (relative to nearest positioned ancestor), fixed (relative to viewport), sticky. `z-index` works on positioned elements.
- `display: none` removes the element and its space; `visibility: hidden` hides it but keeps the space.
- Units: px (absolute), em (relative to parent font size), rem (relative to root font size), % , vw/vh.
- Text: `color`, `font-size`, `font-family`, `font-weight: bold`, `text-align`, `text-decoration: underline`, `text-transform: uppercase`. Background: `background-color`, `background-image`. Colours: `#FF0000` = `rgb(255,0,0)` = red.
- Layout: `float`/`clear`, Flexbox (`display:flex`, `justify-content` main axis, `align-items` cross axis), Grid.

## 7. JavaScript basics

- `var` is function-scoped and hoisted (initialised to undefined); `let` and `const` are block-scoped and in the temporal dead zone before declaration; `const` cannot be reassigned.
- Types: number, string, boolean, undefined, null, object, symbol, bigint. `typeof null` → "object"; `typeof []` → "object"; `typeof NaN` → "number".
- `==` converts types (`5 == "5"` true), `===` does not (`5 === "5"` false). `NaN === NaN` is false.
- `"5" + 3` → "53"; `"5" - 3` → 2; `true + 1` → 2. `parseInt("42px")` → 42.
- Arrays are copied by reference. `[10, 1, 3].sort()` → [1, 10, 3] (string order); numeric sort needs `(a, b) => a - b`.
- Functions: declarations, expressions, arrow functions, default parameters, closures (inner function remembers outer variables).
- Dialogs: `alert()` (message), `confirm()` (returns true/false), `prompt()` (returns string or null).

## 8. DOM and events

- DOM (Document Object Model) represents the page as a tree; `document` is the root object, `window` the global object.
- Selecting: `getElementById` (one element), `getElementsByClassName` / `getElementsByTagName` (live HTMLCollection), `querySelector` (first match), `querySelectorAll` (static NodeList).
- Changing: `innerHTML` (parses markup), `textContent` (plain text), `style.color`, `setAttribute`, `createElement` + `appendChild`, `removeChild`.
- Events: `onclick`, `onload`, `onchange`, `onsubmit`, `onmouseover`, `onkeyup`, `onfocus`, `onblur`. `addEventListener("click", fn)` (no "on" prefix).
- Default flow: capturing (top-down) then target then bubbling (inner to outer); listeners run in the bubbling phase by default. `stopPropagation()` stops bubbling; `preventDefault()` stops the default action (e.g. form submit, link navigation).

## 9. Client–server model and HTTP

- Browser = client; web server (Apache, Nginx, IIS) serves pages. Client-side scripting: JavaScript. Server-side: PHP, ASP.NET, JSP, Python, Node.js.
- HTTP is stateless and request–response; HTTP on port 80, HTTPS (HTTP over TLS) on 443. Cookies are stored in the browser; sessions on the server.
- Methods: GET (read), POST (create/submit; not idempotent), PUT (replace), PATCH (partial update), DELETE, HEAD (headers only), OPTIONS (allowed methods). GET, HEAD, PUT, DELETE are idempotent.
- Status classes: 1xx informational, 2xx success (200 OK, 201 Created), 3xx redirection (301 permanent, 302 temporary, 304 Not Modified), 4xx client error (400, 401 Unauthorized, 403 Forbidden, 404 Not Found), 5xx server error (500, 502, 503).

## 10. E-commerce models

- B2C (Amazon, Flipkart selling to shoppers), B2B (manufacturer to supplier; uses EDI), C2C (OLX, Quikr, eBay), C2B (freelancers, stock photos, reverse auctions), B2G (businesses selling on GeM), G2C (government services to citizens, e.g. DigiLocker), G2B, G2G.
- M-commerce = commerce on mobile devices. A payment gateway authorises online card/UPI payments. ONDC (2022) is India's open network for digital commerce.

## 11. Web security

- **XSS**: injected script runs in other users' browsers; defend with output encoding, input validation, Content Security Policy, HttpOnly cookies.
- **SQL injection**: input such as `' OR '1'='1` alters the query; defend with prepared statements/parameterised queries.
- **CSRF**: forged request using the victim's logged-in session; defend with anti-CSRF tokens and SameSite cookies.
- **HTTPS/TLS**: encryption + server authentication through certificates issued by a Certificate Authority. Cookie flags: `Secure` (HTTPS only), `HttpOnly` (hidden from JavaScript).

## 12. XML and JSON

- XML (eXtensible Markup Language, W3C 1998): user-defined tags, case-sensitive, exactly one root element, every tag closed and properly nested, attribute values quoted. Well-formed = obeys syntax; valid = well-formed + conforms to DTD/XSD. XSLT transforms XML; comments are `<!-- -->`.
- JSON (JavaScript Object Notation): keys and strings in double quotes; values may be string, number, boolean, null, object, array; no comments, no trailing commas, no undefined or functions. `JSON.parse()` converts text to an object; `JSON.stringify()` converts an object to text (dropping undefined properties).

## 13. Frequently asked in DSSSB

- Tag/attribute identification: `alt`, `href`, `target="_blank"`, `colspan`/`rowspan`, `<th>`, `<ol type start>`, form `action`/`method`.
- Difference between GET and POST; between `<div>` and `<span>`; between ID and class selectors.
- Ways of including CSS and their priority; box-model width calculation.
- JavaScript output snippets with `typeof`, `==` vs `===`, string concatenation.
- E-commerce model for a given company; full forms (HTML, CSS, XML, JSON, HTTP, URL).

## 14. Fifteen one-liners

1. HTML was created by Tim Berners-Lee; HTML5 uses `<!DOCTYPE html>`.
2. `<br>`, `<hr>`, `<img>`, `<input>` are void elements.
3. `<th>` cells are bold and centred by default.
4. `colspan` spans columns; `rowspan` spans rows.
5. Radio buttons in a group share the same `name`.
6. GET data appears in the URL; POST data travels in the body.
7. `#id`, `.class`, `element` — ID selector is the most specific of the three.
8. Box order: content, padding, border, margin.
9. Default `position` is static.
10. `em` is relative to the parent; `rem` to the root element.
11. JavaScript was written by Brendan Eich in 1995 at Netscape.
12. `typeof null` is "object".
13. `addEventListener` takes the event name without "on".
14. HTTP 404 = Not Found; 500 = Internal Server Error; HTTPS uses port 443.
15. OLX = C2C; GeM = B2G; Flipkart = B2C.

## 15. Five traps

1. **Class order myth**: `class="b a"` does not make `.b` win; only the stylesheet order (or specificity) decides.
2. **readonly vs disabled**: readonly values are submitted; disabled values are not.
3. **`<ol start>`** takes a number even for letters: `type="a" start="4"` begins at "d".
4. **Default sort**: `[10, 1, 3].sort()` gives [1, 10, 3], not [1, 3, 10].
5. **Hoisting**: `console.log(x); var x = 7;` prints undefined, but the same code with `let` throws a ReferenceError.
