# Web Technologies

⭐ = Asked in DSSSB (2023–24 papers: 30 questions from this chapter). Sources: MDN, W3C, Microsoft Docs, Oracle Java EE docs.

**In 30 seconds**
- The web is client–server: the browser (client) sends an HTTP request, the web server returns an HTTP response. ⭐
- Front end = what runs in the browser (HTML, CSS, JavaScript, jQuery, Angular, React). Back end = what runs on the server (PHP, Java servlets, ASP.NET, Node.js, Python/Django) plus the database. ⭐
- HTML favourites: `href` makes a link, `target="_top"` breaks out of frames, `<hr>` has SIZE/WIDTH/ALIGN/NOSHADE (no SHADE), VLINK = visited-link colour, comments are `<!-- -->`. ⭐
- External CSS is `<link rel="stylesheet" href="style.css">` inside `<head>`. ⭐
- XML names: start with a letter or underscore, no spaces, case-sensitive, never start with "xml". External DTD: `<!DOCTYPE root SYSTEM "file.dtd">`. DOM builds a tree; SAX fires events. ⭐
- Server side: CGI is the web-server-to-program standard; a servlet lives inside a container (init → service → destroy); ASP.NET controls need `runat="server"`. ⭐
- jQuery effects: hide/show/toggle, fadeIn/fadeOut, slideUp/slideDown, animate. AngularJS: ng-app, ng-model (two-way binding), ng-bind, ng-repeat. ⭐
- E-commerce: B2C Flipkart, C2C OLX, B2G GeM, G2C DigiLocker. Security: HTTPS, XSS, SQL injection, CSRF, CAPTCHA.

## 1. How the web works

| Term | Meaning |
|---|---|
| Client–server ⭐ | Client (browser) requests; server (Apache, Nginx, IIS) responds. Many clients, one server |
| URL | `scheme://host:port/path?query#fragment` e.g. `https://ex.com:443/a.html?id=5#top` |
| HTTP | Stateless request–response protocol; port 80. HTTPS = HTTP over TLS, port 443 |
| Request / response | Method + URL + headers (+ body) / status code + headers + body |
| Static page | Same file for every user (plain .html) |
| Dynamic page | Built per request by a server program (PHP, JSP, ASP.NET) or changed in the browser by JS |
| Web server | Serves files over HTTP: Apache HTTP Server, Nginx, Microsoft IIS |
| Application server | Runs business logic/components: Tomcat (servlet container), JBoss/WildFly, WebLogic, WebSphere, GlassFish |

**GET vs POST**

| GET | POST |
|---|---|
| Data in URL query string (visible, bookmarkable) | Data in request body (not in URL) |
| Length limited by URL size | No practical limit; file upload possible |
| Idempotent; for reading | Not idempotent; for submitting/changing data |
| Default `method` of `<form>` | Must be written: `method="post"` |

**Status-code classes**: 1xx informational · 2xx success (200 OK, 201 Created) · 3xx redirection (301 moved permanently, 302 found, 304 not modified) · 4xx client error (400, 401 unauthorised, 403 forbidden, 404 not found) · 5xx server error (500, 502 bad gateway, 503 unavailable).

**Front end vs back end ⭐**

| Front end (client side, UI) | Back end (server side) |
|---|---|
| HTML, CSS, JavaScript ⭐ | PHP ⭐, Node.js, Java servlets/JSP, ASP.NET (C#), Python (Django, Flask), Ruby on Rails |
| jQuery ⭐, AngularJS/Angular ⭐, React, Vue | Databases: MySQL, PostgreSQL, Oracle, SQL Server, MongoDB; SQL ⭐ |
| Bootstrap, Tailwind, Sass ⭐ | Web/app servers: Apache, Nginx, IIS, Tomcat |
| Tools: VS Code, Chrome DevTools ⭐ | APIs (REST), business logic |

- "Front-end development tools" = software that helps build attractive layouts and apps easily. ⭐
- **Web-based database front end ⭐**: the **web browser** is the universal front end of database applications; it reaches the back-end database through the internet via the web server. ⭐
- 3-tier: browser → web/app server → database server.

## 2. HTML basics

HTML = HyperText Markup Language (Tim Berners-Lee, 1991); HTML5 is the current W3C/WHATWG living standard. Tags are not case-sensitive.

```html
<!DOCTYPE html>
<html>
<head><title>My page</title><link rel="stylesheet" href="style.css"></head>
<body bgcolor="white" text="black" link="blue" vlink="purple" alink="red">
  <!-- This is a comment -->
  <h1>Hello</h1><p>Line one<br>Line two</p><hr size="3" width="50%" align="center" noshade>
</body>
</html>
```

| Part | Role |
|---|---|
| `<!DOCTYPE html>` | Tells browser the HTML version (HTML5); not a tag; first line |
| `<html>` | Root element |
| `<head>` ⭐ | Container for information **about** the page (metadata): `<title>`, `<meta>`, `<link>`, `<style>`, `<script>`, `<base>`, `<noscript>` |
| `<title>` | Text in the browser tab/title bar; one per page |
| `<meta>` | `charset="UTF-8"`, `name="viewport"`, `description`, `keywords` |
| `<base>` | Default URL/target for all relative links on the page |
| `<body>` | Visible content |

**Body attributes ⭐** (old HTML; use CSS today)

| Attribute | Sets |
|---|---|
| `bgcolor` | Background colour |
| `background` | Background image |
| `text` | Normal text colour |
| `link` | Unvisited link colour |
| `alink` | **Active** link colour (while being clicked) |
| `vlink` ⭐ | **Visited** link colour (after it has been clicked) |

**`<hr>` attributes ⭐**: `size` (thickness), `width` (px or %), `align` (left/center/right), `noshade` (solid, no 3-D shading), `color` (IE only). There is **no** SHADE attribute. ⭐
**`<br>` ⭐** inserts a line break; empty (void) element. Comments ⭐: `<!-- text -->` (not displayed; cannot nest).

**Text, lists, links, images**

| Tag | Use / key attributes |
|---|---|
| `<h1>`–`<h6>` | 6 heading levels; h1 largest |
| `<p>`, `<pre>` | Paragraph; preformatted (keeps spaces and line breaks) |
| `<b>`, `<i>`, `<u>` | Bold, italic, underline (presentational) |
| `<strong>`, `<em>`, `<mark>` | Strong importance, emphasis, highlight (semantic) |
| `<sub>`, `<sup>`, `<del>`, `<ins>`, `<small>` | H₂O, x², struck-out, inserted, small text |
| `<font face size color>`, `<center>` | Deprecated (obsolete in HTML5) |
| `<ol type start>` | Ordered list; type 1, A, a, I, i |
| `<ul type>` | Unordered list; disc, circle, square |
| `<li>` | List item |
| `<dl>`, `<dt>`, `<dd>` | Description list: term, description |
| `<a href>` ⭐ | Hyperlink; **href** = hypertext reference (destination) ⭐ |
| `<a name>` / `id` | Bookmark target; link to it with `href="#top"` |
| `<a href="mailto:x@y.com">` | E-mail link |
| `<img src alt width height border align usemap>` | Image (void); `alt` = text if image fails |

**`target` values ⭐**

| Value | Opens linked page in |
|---|---|
| `_self` | Same frame/window (default) |
| `_blank` | New window or tab |
| `_parent` | Immediate parent frame |
| `_top` ⭐ | Full body of the window (breaks out of all frames) |
| `framename` | The named frame/iframe |

**Tables**

| Tag/attribute | Meaning |
|---|---|
| `<table border>` | Table; `border="1"` shows grid lines |
| `<tr>`, `<th>`, `<td>` | Row, header cell (bold, centred), data cell |
| `<caption>`, `<thead>`, `<tbody>`, `<tfoot>` | Title, header/body/footer groups |
| `colspan` / `rowspan` | Cell spans columns / rows |
| `cellpadding` | Space between cell border and content |
| `cellspacing` | Space between cells |

**Forms**

| Item | Detail |
|---|---|
| `<form action method enctype>` | `action` = URL of server program; `method` GET (default) or POST; `enctype="multipart/form-data"` for file upload |
| `<input type>` | text, password, radio, checkbox, submit, reset, button, file, hidden, image; HTML5: email, number, date, range, color, url, tel, search |
| Input attributes | name, value, placeholder, required, readonly, disabled, maxlength, checked, pattern, autofocus |
| `<select>` + `<option selected>` | Drop-down; `multiple` allows many |
| `<textarea rows cols>` | Multi-line text |
| `<label for="id">` | Caption tied to a control |
| `<button type>` | submit / reset / button |
| `<fieldset>` + `<legend>` | Group of controls with a caption |

- Radio buttons in a group share one `name`.

**HTML5 and media**

| Tag | Use |
|---|---|
| `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` | Semantic layout |
| `<iframe src width height name>` | Embed another page (frameset/frame are obsolete in HTML5) |
| `<audio src controls autoplay loop muted>` | Sound (mp3, ogg, wav) |
| `<video src controls poster width>` | Video (mp4, webm, ogg); `<source>` gives alternatives |

**Entities**: `&lt;` < · `&gt;` > · `&amp;` & · `&nbsp;` non-breaking space · `&quot;` " · `&copy;` © · `&reg;` ®.

**DHTML and data binding ⭐**
- DHTML (Dynamic HTML) = HTML + CSS + JavaScript + DOM working together; not a separate language (IE 4/Netscape 4, 1997).
- Data binding: a **Data Source Object** supplies data to page elements via `datasrc`, `datafld`, `dataformatas`.
- **Tabular Data Control (TDC) ⭐**: Microsoft **ActiveX** control (IE) that reads a delimited text file, sorts/filters it and shows the data in chosen areas of the page. Parameters: `DataURL`, `FieldDelim`, `UseHeader`. Other DSOs: XML DSO, RDS.

## 3. CSS

CSS = Cascading Style Sheets (Håkon Wium Lie, 1994; CSS1 1996). Rule: `selector { property: value; }`; comment `/* */`.

**Three ways to add CSS ⭐**

| Way | Syntax | Scope |
|---|---|---|
| Inline | `<p style="color:red">` | One element; highest priority |
| Internal (embedded) | `<style> p {color:red} </style>` in `<head>` | One page |
| External ⭐ | `<link rel="stylesheet" type="text/css" href="style.css">` in `<head>` | Many pages; file has no `<style>` tags |

- `<style>` has no `href`; `<a href>` cannot load CSS. `@import url("a.css");` also loads a sheet.
- Cascade: `!important` > inline > internal/external (the later rule wins at equal specificity) > browser default.
- Specificity: inline 1000 · ID 100 · class/attribute/pseudo-class 10 · element/pseudo-element 1.

**Selectors**

| Selector | Example | Selects |
|---|---|---|
| Universal | `*` | Every element |
| Type | `p` | All `<p>` |
| Class | `.note` | class="note" |
| ID | `#header` | id="header" (unique) |
| Group | `h1, h2` | Both |
| Descendant / child | `div p` / `div > p` | Any depth / direct child |
| Adjacent / general sibling | `h1 + p` / `h1 ~ p` | Next p / all following p |
| Attribute | `input[type="text"]` | Matching attribute |
| Pseudo-class | `a:hover`, `:first-child`, `:nth-child(2)` | State/position |
| Pseudo-element | `::before`, `::after`, `::first-letter` | Part of element |

**Core properties**

| Area | Properties |
|---|---|
| Box model | content → padding → border → margin; `box-sizing: border-box` includes padding+border in width |
| Colour | names, `#FF0000`, `rgb(255,0,0)`, `rgba(…, 0.5)` (alpha), `hsl()` |
| Fonts/text | font-family, font-size, font-style, font-weight, text-align, text-decoration, text-transform, line-height, letter-spacing |
| display | block, inline, inline-block, none (removes space), flex, grid; `visibility:hidden` keeps space |
| position | static (default), relative, absolute (to positioned ancestor), fixed (viewport), sticky; `z-index` stacks |
| Flexbox | One-dimensional layout: `display:flex`, `justify-content` (main axis), `align-items` (cross axis) |
| Grid | Two-dimensional rows+columns: `display:grid; grid-template-columns: 1fr 1fr` |

**Transitions ⭐** — change property values smoothly over a duration.

| Property | Meaning |
|---|---|
| `transition-property` | Which property (width, color, all) |
| `transition-duration` | How long (default 0s) |
| `transition-timing-function` | ease (default), linear, ease-in, ease-out, ease-in-out, cubic-bezier() |
| `transition-delay` | Wait before start |

```css
div { width: 100px; transition: width 2s ease-in 0.5s; }
div:hover { width: 300px; }
```

- **Animations**: `@keyframes name { from {…} to {…} }` + `animation-name`, `-duration`, `-iteration-count` (infinite), `-direction` (alternate), `-delay`, `-fill-mode`. Transition needs a trigger; animation runs by itself.
- **filter ⭐**: `blur(5px)`, `brightness()`, `contrast()`, `grayscale(100%)` ⭐ (black-and-white), `sepia()`, `invert()`, `opacity()`, `saturate()`, `hue-rotate(90deg)`, `drop-shadow()`. Value is never quoted.

```css
img { filter: grayscale(100%); }
```

- **Media queries** (responsive design): `@media screen and (max-width: 600px) { … }` plus `<meta name="viewport" content="width=device-width">`.

**Preprocessors ⭐** — CSS extension languages compiled into plain CSS; add variables, nesting, mixins, partials, inheritance.

| Preprocessor | Files | Note |
|---|---|---|
| Sass ⭐ | .sass (indented), .scss (braces) | "Syntactically Awesome Style Sheets"; most widely used; variables `$main` |
| Less | .less | Variables `@main`; JS-based |
| Stylus | .styl | Optional braces/colons |

- Not preprocessors: TypeScript (extends JS), Git (version control), VS Code (editor).
- **CSS frameworks**: Bootstrap (12-column grid), Tailwind, Foundation.

## 4. JavaScript

| Topic | Facts |
|---|---|
| Origin | Brendan Eich, Netscape, 1995; standard = ECMAScript (ES6 = ES2015) |
| Where it runs | Browser engine (V8 Chrome, SpiderMonkey Firefox) and server via Node.js |
| Inclusion | `<script>…</script>` or `<script src="app.js"></script>`; `defer`/`async` |
| Output | `document.write()` ⭐, `innerHTML`, `alert()`, `console.log()` |
| Variables | `var` (function scope, hoisted as undefined), `let` (block), `const` (block, no reassignment) |
| Types | number, string, boolean, undefined, null, object, symbol, bigint |
| Operators | `==` (converts type) vs `===` (strict), `%`, `**`, `&&`, `||`, `!`, `?:`, `typeof` |
| Dialogs | `alert()` message, `confirm()` true/false, `prompt()` string or null |

**Outputs verified with Node**

| Code | Result |
|---|---|
| `typeof null` / `typeof []` / `typeof NaN` | "object" / "object" / "number" |
| `"5" + 3` / `"5" - 3` / `true + 1` | "53" / 2 / 2 |
| `1 + 2 + "3"` / `"1" + 2 + 3` | "33" / "123" |
| `5 == "5"` / `5 === "5"` / `NaN === NaN` | true / false / false |
| `[10, 1, 3].sort()` | [1, 10, 3] (string order) |
| `console.log(x); var x = 7;` | undefined (with `let`: ReferenceError) |
| `JSON.stringify({a:1, b:undefined})` | `{"a":1}` |

**document.write ⭐**: writes text/HTML straight into the page; successive calls join with no gap. The browser collapses any whitespace (space, newline) to one space.

```js
document.write("Hello"); document.write("\nIndia");  // shows: Hello India
document.write("Hello"); document.write("India");    // shows: HelloIndia
```

**DOM and events**

| Item | Use |
|---|---|
| `document.getElementById("x")` | One element by id |
| `getElementsByClassName`, `getElementsByTagName` | Live collection |
| `querySelector(".c")` / `querySelectorAll` | First match / all matches (CSS selector) |
| `innerHTML` / `textContent` | Set markup / plain text |
| `el.style.color = "red"`, `setAttribute`, `createElement`, `appendChild` | Change page |
| Events | onclick, onload, onchange, onsubmit, onmouseover, onmouseout, onkeyup, onfocus, onblur |
| `addEventListener("click", fn)` | Event name without "on" |

- **Arrays/objects/JSON**: `[1,2,3].push(4)` returns new length 4; `{name:"Ram", age:20}`; JSON keys in double quotes; `JSON.parse()` text→object, `JSON.stringify()` object→text.
- **AJAX** (Asynchronous JavaScript and XML; term 2005): update part of a page without reload using `XMLHttpRequest` (readyState 4 + status 200 = done) or `fetch(url).then(r => r.json())`.

**jQuery ⭐** (John Resig, 2006, "write less, do more") — `$(selector).action()`; `$(document).ready(fn)`.

| Group | Methods |
|---|---|
| Selectors | `$("p")`, `$("#id")`, `$(".cls")`, `$(this)` |
| Show/hide | `hide()`, `show()`, `toggle()` |
| Fade | `fadeIn()`, `fadeOut()`, `fadeToggle()`, `fadeTo(speed, opacity)` |
| Slide ⭐ | `slideDown()` ⭐ (show by sliding down), `slideUp()`, `slideToggle()` |
| Custom | `animate({left:"250px"}, speed)`, `stop()`, `delay()` |
| Speed | "slow" 600 ms, "fast" 200 ms, default 400 ms |

- No such methods: moveDown(), moveBelow(), slideBelow().

**AngularJS ⭐** (Google, 2010; MVC framework; Angular 2+ uses TypeScript)

| Directive | Job |
|---|---|
| `ng-app` | Starts/defines the AngularJS application (root) |
| `ng-model` ⭐ | Binds input/select/textarea value to model data (two-way binding) |
| `ng-bind` | Writes model value into an element (one-way, model→view) |
| `ng-init` | Initialises variables |
| `ng-repeat` | Repeats an element for each item of a collection |
| `ng-controller` | Attaches a controller (and its `$scope`) |
| `ng-show` / `ng-hide` / `ng-if` / `ng-click` | Visibility, condition, click handler |

- Expressions: `{{ 5 + 5 }}` → 10. Filters: uppercase, lowercase, currency, orderBy, date. Services: `$scope`, `$http`.
- Two-way binding: changing the input updates the model and every bound view instantly.
- **React** (Facebook/Meta, 2013): component-based UI library with JSX and a virtual DOM. **Vue** (Evan You, 2014): progressive framework.

## 5. XML ⭐

XML = eXtensible Markup Language (W3C, 1998; derived from SGML). Purpose: **store and transport** data with user-defined tags (HTML **displays** data).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note SYSTEM "note.dtd">
<note id="1"><to>Ravi</to><body>Hi</body></note>
```

| Syntax rule | Detail |
|---|---|
| One root element | Encloses all others |
| Every tag closed | `<a></a>` or empty `<a/>` |
| Proper nesting | `<b><i></i></b>` |
| Case-sensitive | `<Note>` ≠ `<note>` |
| Attribute values quoted | `id="1"` |
| Comments / CDATA | `<!-- -->` / `<![CDATA[ unparsed text ]]>` |

**Element naming rules ⭐**: start with a **letter or underscore** (not a digit or punctuation); may contain letters, digits, hyphen, underscore, period; **no spaces**; case-sensitive; must **not start with "xml"** (any case; reserved). Checked: `_id`, `first-name`, `Price.INR` valid; `1st`, `first name`, `XMLdata` invalid.

- **Well-formed** = obeys syntax rules. **Valid** = well-formed **and** conforms to a DTD/XSD. Every valid document is well-formed, not vice versa.

**DTD ⭐** (Document Type Definition)

| Type | Syntax |
|---|---|
| Internal | `<!DOCTYPE note [ <!ELEMENT note (to,body)> … ]>` |
| External ⭐ | `<!DOCTYPE root-element SYSTEM "file-name">` e.g. `<!DOCTYPE note SYSTEM "note.dtd">` |

| Declaration ⭐ | Meaning |
|---|---|
| `<!ELEMENT element-name category>` ⭐ | Element declaration; category EMPTY, ANY, (#PCDATA) or (children) |
| `<!ELEMENT to (#PCDATA)>` | Parsed character data (text) |
| `(a, b)` / `(a \| b)` | Sequence / choice |
| `a+` / `a*` / `a?` | One or more / zero or more / zero or one |
| `<!ATTLIST el attr CDATA #REQUIRED>` | Attribute; defaults #REQUIRED, #IMPLIED, #FIXED "v" |
| `<!ENTITY name "value">` | Entity, used as `&name;` |

```xml
<!ELEMENT book (title, author+, price?, note*)>
```

- **XML Schema (XSD)**: written in XML itself, supports data types (`xs:string`, `xs:integer`, `xs:date`) and namespaces — richer than DTD.
- **Namespaces**: avoid name clashes: `xmlns:h="http://www.w3.org/TR/html4/"` then `<h:table>`.
- **XML processor ⭐** (parser): software that **reads XML documents and gives applications access to their content and structure**.

**Parsers: DOM vs SAX ⭐**

| DOM ⭐ | SAX |
|---|---|
| Document Object Model (W3C) | Simple API for XML |
| Loads whole document as an in-memory **tree** of objects ⭐ | **Event-based**: startElement, characters, endElement |
| Random access; read **and** modify | Sequential, read-only, forward only |
| High memory; slow for big files | Low memory; fast for big files |

- Other XML parsers/APIs: JDOM, StAX (pull), Xerces. "Shell" is not a parser. ⭐
- **XSLT**: transforms XML into HTML/text/other XML. **XPath**: path language to select nodes (`/library/book[1]/title`). XQuery queries XML.

## 6. Server-side technologies

| Technology | Key facts |
|---|---|
| **CGI ⭐** | Common Gateway Interface (NCSA, 1993): **the standard that defines how a web server communicates with application programs**; one new process per request (slow); Perl/C scripts in `cgi-bin` |
| **Java servlet ⭐** | Java class that runs **inside a web server/servlet container** (Tomcat) and answers requests, usually over HTTP; one thread per request |
| **JSP** | HTML with Java; translated into a servlet. `<% %>` scriptlet, `<%= %>` expression, `<%@ %>` directive |
| **PHP** | Rasmus Lerdorf, 1994; `<?php echo "Hi"; ?>`; `$var`; `$_GET`, `$_POST`, `$_SESSION`; `.` joins strings |
| **ASP.NET ⭐** | Microsoft, 2002, .NET/CLR; `.aspx` pages + code-behind (`.aspx.cs`) |
| **Node.js** | Ryan Dahl, 2009; JavaScript on the server (V8), event-driven non-blocking I/O, npm |

**Servlet life cycle ⭐** (container calls)

| Step | Called |
|---|---|
| Load + instantiate | Once |
| `init(ServletConfig)` | Once, at start |
| `service(req, res)` | For every request; HttpServlet routes to `doGet()` / `doPost()` |
| `destroy()` | Once, before removal |

- `GenericServlet` is protocol-independent; `HttpServlet` extends it for HTTP. Mapped in `web.xml` or `@WebServlet`.

**ASP.NET ⭐**
- Server control syntax ⭐: `<asp:controlType ID="ControlID" runat="server" Property1=value1 />` — **runat** (not runin/runas/run).

```html
<asp:Button ID="btnSave" runat="server" Text="Save" OnClick="btnSave_Click" />
```

- Control families: HTML server controls (HTML tag + `runat="server"`), web server controls (`asp:TextBox`, `asp:GridView`), validation controls (RequiredFieldValidator, RangeValidator, CompareValidator, RegularExpressionValidator).
- **Event ⭐** = an action or occurrence (mouse click, key press, mouse movement, system notification) that runs an event handler. Directive = compiler instruction (`<%@ Page %>`); validator = checks input.
- Page events in order: PreInit → **Init** → InitComplete → PreLoad → **Load (`Page_Load`)** → control events (Button click) → LoadComplete → PreRender → SaveStateComplete → Render → **Unload**. `IsPostBack` tells first load from postback.
- State: ViewState, cookies, query string (client side); Session, Application (server side).

**ADO.NET ⭐** (data access in .NET). Features ⭐: interoperability (XML), maintainability, programmability, performance, scalability — **not** "reachability".

| Connected | Disconnected |
|---|---|
| Connection stays open while reading | Data copied, connection closed |
| `Connection`, `Command`, **`DataReader`** (forward-only, read-only, fast) | `DataAdapter` (`Fill()`, `Update()`) + **`DataSet`** (in-memory tables, relations; XML-based) |

- `Command` methods: `ExecuteReader()` (rows), `ExecuteNonQuery()` (INSERT/UPDATE/DELETE), `ExecuteScalar()` (single value).

**Sessions and cookies**

| Cookie | Session |
|---|---|
| Small text (≈4 KB) stored in the **browser** | Data stored on the **server**; only session ID goes to browser |
| Session cookie (deleted on close) or persistent (expiry date) | Ends on logout/time-out |
| Flags: `Secure` (HTTPS only), `HttpOnly` (hidden from JS), `SameSite` | Safer for sensitive data |


## 7. E-commerce

| Model | Meaning | Example |
|---|---|---|
| B2B | Business to business | IndiaMART, Alibaba, EDI between firms |
| B2C | Business to consumer | Amazon, Flipkart |
| C2C | Consumer to consumer | OLX, Quikr, eBay |
| C2B | Consumer to business | Freelancers on Upwork, stock photos, reverse auctions |
| B2G | Business to government | Firms selling on GeM |
| G2C | Government to citizen | DigiLocker, IRCTC, online tax/bill payment |

- M-commerce = commerce on mobile. **Payment gateway** = service that authorises and routes online card/UPI/net-banking payments between customer, merchant and bank (Razorpay, PayU, CCAvenue). UPI by NPCI, 2016. Card data security standard: PCI DSS.

## 8. Web security

| Threat / tool | What it is | Defence |
|---|---|---|
| HTTPS / SSL-TLS | Encrypts traffic; certificate from a Certificate Authority proves server identity (padlock) | Use HTTPS everywhere |
| XSS | Attacker's script injected into a page runs in other users' browsers (stored, reflected, DOM) | Output encoding, input validation, CSP, HttpOnly cookies |
| SQL injection | Input like `' OR '1'='1` changes the query | Prepared/parameterised queries |
| CSRF | Forged request rides on the victim's logged-in session | Anti-CSRF token, SameSite cookies |
| Phishing | Fake site/e-mail steals passwords | Check URL, 2FA |
| Cookies & privacy | Third-party cookies track users across sites | Consent, blocking |
| Validation | Client-side (HTML5 `required`, JS) = convenience; server-side = mandatory | Validate on server always |
| CAPTCHA | Completely Automated Public Turing test to tell Computers and Humans Apart | Blocks bots (reCAPTCHA) |

## 9. Hosting, domains, CMS
- **Web hosting**: renting server space to publish a site (shared, VPS, dedicated, cloud).
- **Domain name**: readable address (`example.in`) mapped to an IP by DNS; bought from a registrar; ICANN manages the system; TLDs .com, .org, .in.
- **CMS**: software to build/manage sites without coding (WordPress, Joomla, Drupal).

## Exam traps
1. VLINK = **visited** link colour; ALINK = **active** (during click); LINK = unvisited. HLINK does not exist.
2. `<hr>` has **NOSHADE**, not SHADE.
3. `_top` = whole window; `_parent` = only one frame up; `_self` is the default.
4. External CSS uses `<link … href>`; `<style>` never takes `href`.
5. `filter: grayscale(100%)` — not `graycolor`, and not in quotes.
6. HTML comment opens `<!--` and closes `-->` with **no** `!` at the end.
7. XML names may start with an underscore but never a digit, never "xml", never contain spaces.
8. External DTD order: `<!DOCTYPE` **root-element** `SYSTEM "file">` — root name comes first.
9. A servlet does **not** run without a web server/container.
10. CGI question (key doubt): textbook answer for "standard for web server–application program communication" is **CGI**; the official key said HTTP. HTTP is browser-to-server. Also: the document.write PYQ printed a raw newline inside quotes — real JS needs `"\nIndia"` (a raw newline is a SyntaxError, checked in Node); the intended answer is "Hello India".

## One-liners for revision
1. Client = browser; server = Apache/Nginx/IIS.
2. HTTP port 80; HTTPS port 443; HTTP is stateless.
3. GET puts data in the URL; POST in the body; form default is GET.
4. 404 Not Found; 500 Internal Server Error; 301 permanent redirect.
5. JavaScript is front end; PHP, Django and SQL are back end.
6. PHP is not a front-end design tool; jQuery, AngularJS, Chrome DevTools are.
7. The web browser is the universal front end of web database applications.
8. `<head>` holds metadata: title, meta, link, style, script, base.
9. `href` = hypertext reference, the link's destination.
10. `<br>` = line break; `<hr>` = horizontal rule; both void.
11. HR attributes: SIZE, WIDTH, ALIGN, NOSHADE.
12. Body colour attributes: bgcolor, text, link, vlink, alink.
13. `target="_blank"` opens a new tab; `_top` the full window.
14. `colspan` merges columns; `rowspan` merges rows.
15. `cellpadding` is inside a cell; `cellspacing` is between cells.
16. File upload needs `method="post"` and `enctype="multipart/form-data"`.
17. DHTML = HTML + CSS + JavaScript + DOM.
18. TDC is a Microsoft ActiveX control for DHTML data binding.
19. Inline CSS beats internal and external CSS; `!important` beats all.
20. ID selector `#`, class selector `.`.
21. Transitions change values smoothly over a duration; four sub-properties.
22. Sass is the most widely used CSS extension language; Less and Stylus are others.
23. Box model: content, padding, border, margin.
24. `document.write` writes directly into the page.
25. `typeof null` is "object".
26. `let`/`const` are block-scoped; `var` is function-scoped.
27. jQuery `slideDown()` reveals by sliding; `fadeOut()` hides by fading.
28. AngularJS `ng-model` gives two-way binding; `ng-app` starts the app.
29. XML stores/transports data; HTML displays it.
30. Valid XML = well-formed + follows DTD/XSD.
31. DOM parser = tree in memory; SAX = event-based stream.
32. XML processor reads XML and gives access to content and structure.
33. Servlet life cycle: init() → service() → destroy().
34. ASP.NET control: `<asp:Type ID="x" runat="server" />`.
35. DataReader = connected, forward-only; DataSet = disconnected, in-memory.

## Quick self-check
1. Which body attribute sets the colour of a link after it is clicked? — **VLINK**.
2. Which `<hr>` attribute draws a solid line? — **NOSHADE**.
3. Which target value opens the page in the full window body? — **_top**.
4. Write the tag that attaches `style.css`. — `<link rel="stylesheet" type="text/css" href="style.css">`.
5. Output of `document.write("Hello"); document.write("\nIndia");`? — **Hello India** (newline shown as one space).
6. Is `<1price>` a legal XML element name? — **No**; names cannot start with a digit.
7. Write an external DTD reference for root `note`. — `<!DOCTYPE note SYSTEM "note.dtd">`.
8. Which parser keeps the whole XML document as a tree of objects? — **DOM**.
9. Which servlet method runs once for every request? — **service()** (calls doGet/doPost).
10. Which jQuery method shows a hidden element by sliding it down? — **slideDown()**.
