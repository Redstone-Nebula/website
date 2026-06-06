/* =========================================================
 * i18n.js — 红石星云网站多语言核心脚本
 * 依赖：js/i18n-dict.js（须先引入）
 * 用法：在 <body> 末尾 <script src="js/i18n.js"></script>
 * 给元素加上 data-i18n="dict.key"，脚本会把该元素的
 *   textContent 替换为字典对应文本。
 * 给 <title> 加上 data-i18n-title="dict.key" 可替换页面标题。
 * 给元素加上 data-i18n-html="dict.key" 可替换 innerHTML
 *   （用于 code / br 等格式化文本）。
 * 切换语言会写入 localStorage.I18N_LANG 并刷新页面。
 * ========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "I18N_LANG";
  var SUPPORTED = ["zh", "en"];
  var DEFAULT = "zh";

  function detectLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    try {
      var nav = (navigator.language || navigator.userLanguage || "").toLowerCase();
      if (nav.indexOf("zh") === 0) return "zh";
      if (nav.indexOf("en") === 0) return "en";
    } catch (e) {}
    return DEFAULT;
  }

  function resolve(key, lang) {
    var dict = (window.I18N_DICT && window.I18N_DICT[lang]) || {};
    var fallback = (window.I18N_DICT && window.I18N_DICT[DEFAULT]) || {};
    if (Object.prototype.hasOwnProperty.call(dict, key) && dict[key] !== undefined && dict[key] !== "") {
      return dict[key];
    }
    if (Object.prototype.hasOwnProperty.call(fallback, key) && fallback[key] !== undefined && fallback[key] !== "") {
      return fallback[key];
    }
    return null;
  }

  function applyLang(lang) {
    var dict = (window.I18N_DICT && window.I18N_DICT[lang]) || {};

    // <html lang>
    try {
      if (document.documentElement) {
        document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
      }
    } catch (e) {}

    // <title data-i18n-title="...">
    var titleEl = document.querySelector("title");
    if (titleEl && titleEl.getAttribute("data-i18n-title")) {
      var t = resolve(titleEl.getAttribute("data-i18n-title"), lang);
      if (t) titleEl.textContent = t;
    }

    // 普通文本替换
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var key = n.getAttribute("data-i18n");
      var v = resolve(key, lang);
      if (v !== null) n.textContent = v;
    }

    // HTML 文本替换（保留 code/br 等）
    var htmlNodes = document.querySelectorAll("[data-i18n-html]");
    for (var j = 0; j < htmlNodes.length; j++) {
      var hn = htmlNodes[j];
      var hk = hn.getAttribute("data-i18n-html");
      var hv = resolve(hk, lang);
      if (hv !== null) hn.innerHTML = hv;
    }

    // 属性替换：格式 "attr|key" 或多组用 ";" 分隔
    var attrNodes = document.querySelectorAll("[data-i18n-attr]");
    for (var k = 0; k < attrNodes.length; k++) {
      var an = attrNodes[k];
      var parts = an.getAttribute("data-i18n-attr").split(";");
      for (var p = 0; p < parts.length; p++) {
        var pair = parts[p].trim();
        if (!pair) continue;
        var colon = pair.indexOf("|");
        if (colon === -1) continue;
        var attrName = pair.substring(0, colon).trim();
        var attrKey = pair.substring(colon + 1).trim();
        var av = resolve(attrKey, lang);
        if (av !== null) {
          if (attrName === "textContent") an.textContent = av;
          else an.setAttribute(attrName, av);
        }
      }
    }

    // 切换器按钮高亮
    var switchers = document.querySelectorAll("[data-i18n-lang-switch]");
    for (var m = 0; m < switchers.length; m++) {
      var btn = switchers[m];
      if (btn.getAttribute("data-i18n-lang-switch") === lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  }

  function injectSwitcher(lang) {
    // 在第一个 .nav-inner 末尾注入 "中 / EN" 切换器
    var navInner = document.querySelector(".nav-inner");
    if (!navInner) return;
    if (navInner.querySelector(".lang-switch")) return; // 已注入

    var wrap = document.createElement("div");
    wrap.className = "lang-switch";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Language switch");

    var zh = document.createElement("button");
    zh.type = "button";
    zh.className = "lang-switch-btn";
    zh.setAttribute("data-i18n-lang-switch", "zh");
    zh.textContent = "中";
    zh.title = "切换为中文";

    var sep = document.createElement("span");
    sep.className = "lang-switch-sep";
    sep.textContent = "/";

    var en = document.createElement("button");
    en.type = "button";
    en.className = "lang-switch-btn";
    en.setAttribute("data-i18n-lang-switch", "en");
    en.textContent = "EN";
    en.title = "Switch to English";

    function onClick(targetLang) {
      return function (e) {
        e.preventDefault();
        try { localStorage.setItem(STORAGE_KEY, targetLang); } catch (err) {}
        // 软切换：若当前页面有 data-i18n 元素则直接替换；否则刷新
        if (document.querySelector("[data-i18n], [data-i18n-title], [data-i18n-html], [data-i18n-attr]")) {
          applyLang(targetLang);
        } else {
          location.reload();
        }
      };
    }
    zh.addEventListener("click", onClick("zh"));
    en.addEventListener("click", onClick("en"));

    wrap.appendChild(zh);
    wrap.appendChild(sep);
    wrap.appendChild(en);
    navInner.appendChild(wrap);

    // 初始高亮
    if (lang === "zh") zh.classList.add("active");
    else en.classList.add("active");
  }

  function init() {
    var lang = detectLang();
    injectSwitcher(lang);
    applyLang(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
