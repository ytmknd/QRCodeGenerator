// Language dictionary
const I18N = {
  ja: {
    appName: "QRCode Generator",
    title: "QRコードを作成",
    description: "文字列やURLを入力して、QRコード画像を生成できます。",
    inputLabel: "テキスト / URL",
    inputPlaceholder: "例: https://example.com",
    generateBtn: "生成する",
    clearBtn: "クリア",
    preview: "プレビュー",
    previewAria: "QRコードプレビュー",
    downloadBtn: "画像をダウンロード",
    copyBtn: "画像をコピー",
    emptyInput: "入力内容が空です。テキストまたはURLを入力してください。",
    generateSuccess: "QRコードを生成しました。",
    generateError: "QRコードの生成に失敗しました。",
    libraryError: "QRライブラリの読み込みに失敗しました。ページを再読み込みしてください。",
    downloadSuccess: "QRコード画像をダウンロードしました。",
    downloadFirst: "先にQRコードを生成してください。",
    copySuccess: "QRコード画像をクリップボードにコピーしました。",
    copyFirst: "先にQRコードを生成してください。",
    copyNotSupported: "このブラウザは画像のクリップボードコピーに対応していません。",
    copyError: "コピーに失敗しました。HTTPS環境か権限設定を確認してください。",
    clearSuccess: "入力をクリアしました。",
    previewPlaceholder: "ここにQRコードが表示されます",
    footerNote: "✓ すべての処理はブラウザ内で完結します。テキストやQRコード画像がサーバーに送信されることはありません。"
  },
  en: {
    appName: "QRCode Generator",
    title: "Create QR Code",
    description: "Enter text or a URL to generate a QR code image.",
    inputLabel: "Text / URL",
    inputPlaceholder: "Example: https://example.com",
    generateBtn: "Generate",
    clearBtn: "Clear",
    preview: "Preview",
    previewAria: "Generated QR code preview",
    downloadBtn: "Download Image",
    copyBtn: "Copy Image",
    emptyInput: "Input is empty. Please enter text or a URL.",
    generateSuccess: "QR code generated successfully.",
    generateError: "Failed to generate QR code.",
    libraryError: "Failed to load QR library. Please reload the page.",
    downloadSuccess: "QR code image downloaded.",
    downloadFirst: "Generate a QR code first.",
    copySuccess: "QR code image copied to clipboard.",
    copyFirst: "Generate a QR code first.",
    copyNotSupported: "Your browser does not support copying images to clipboard.",
    copyError: "Copy failed. Check HTTPS context or browser permissions.",
    clearSuccess: "Input cleared.",
    previewPlaceholder: "QR code will appear here",
    footerNote: "✓ All processing is completed within the browser. Your text and QR code images are never sent to any server."
  }
};

let currentLanguage = localStorage.getItem("qr-lang") || "ja";

function t(key) {
  return I18N[currentLanguage]?.[key] || I18N.ja[key] || key;
}

function updateUI() {
  document.documentElement.lang = currentLanguage;

  // Update text nodes
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = t(key);
    if (translation !== key) {
      el.textContent = translation;
    }
  });

  // Update placeholder attributes
  document.querySelectorAll("[data-i18n-attr-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-attr-placeholder");
    el.placeholder = t(key);
  });

  // Update aria-label attributes
  document.querySelectorAll("[data-i18n-attr-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-attr-aria-label");
    el.setAttribute("aria-label", t(key));
  });
}

function setLanguage(lang) {
  if (I18N[lang]) {
    currentLanguage = lang;
    localStorage.setItem("qr-lang", lang);
    updateUI();
    updateLanguageSwitcher();
  }
}

function updateLanguageSwitcher() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    if (btn.getAttribute("data-lang") === currentLanguage) {
      btn.classList.add("lang-btn-active");
    } else {
      btn.classList.remove("lang-btn-active");
    }
  });
}

// Global variables for UI elements and state
let textInput;
let preview;
let statusEl;
let generateBtn;
let clearBtn;
let downloadBtn;
let copyBtn;
let currentImageBlob = null;
let currentObjectUrl = null;

// Initialize UI on page load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI element references
  textInput = document.getElementById("qr-text");
  preview = document.getElementById("qr-preview");
  statusEl = document.getElementById("status");
  generateBtn = document.getElementById("generate-btn");
  clearBtn = document.getElementById("clear-btn");
  downloadBtn = document.getElementById("download-btn");
  copyBtn = document.getElementById("copy-btn");

  // Update UI and language switcher
  updateUI();
  updateLanguageSwitcher();

  // Show placeholder before any interaction
  showPlaceholder();

  // Attach event listeners
  generateBtn.addEventListener("click", handleGenerate);
  clearBtn.addEventListener("click", handleClear);
  downloadBtn.addEventListener("click", handleDownload);
  copyBtn.addEventListener("click", handleCopyImage);

  // Language switcher buttons
  document.getElementById("lang-ja").addEventListener("click", () => setLanguage("ja"));
  document.getElementById("lang-en").addEventListener("click", () => setLanguage("en"));

  // Keyboard shortcut: Ctrl+Enter to generate
  textInput.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      handleGenerate();
    }
  });
});

async function handleGenerate() {
  const text = textInput.value.trim();

  if (!text) {
    setStatus(t("emptyInput"), true);
    disableOutputActions();
    showPlaceholder();
    return;
  }

  try {
    const blob = await generateQrBlob(text);
    renderBlobPreview(blob);
    currentImageBlob = blob;
    downloadBtn.disabled = false;
    copyBtn.disabled = false;
    setStatus(t("generateSuccess"), false);
  } catch (error) {
    console.error(error);
    currentImageBlob = null;
    disableOutputActions();
    showPlaceholder();
    const details = error instanceof Error ? error.message : "不明なエラー";
    setStatus(`${t("generateError")}。${details}`, true);
  }
}

function handleClear() {
  textInput.value = "";
  clearObjectUrl();
  currentImageBlob = null;
  disableOutputActions();
  showPlaceholder();
  setStatus(t("clearSuccess"), false);
}

function handleDownload() {
  if (!currentImageBlob) {
    setStatus(t("downloadFirst"), true);
    return;
  }

  const link = document.createElement("a");
  const url = URL.createObjectURL(currentImageBlob);
  link.href = url;
  link.download = "qr-code.png";
  link.click();
  URL.revokeObjectURL(url);

  setStatus(t("downloadSuccess"), false);
}

async function handleCopyImage() {
  if (!currentImageBlob) {
    setStatus(t("copyFirst"), true);
    return;
  }

  if (!navigator.clipboard || !window.ClipboardItem) {
    setStatus(t("copyNotSupported"), true);
    return;
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": currentImageBlob
      })
    ]);
    setStatus(t("copySuccess"), false);
  } catch (error) {
    console.error(error);
    setStatus(t("copyError"), true);
  }
}

async function generateQrBlob(text) {
  if (!window.QRCode || typeof window.QRCode !== "function") {
    throw new Error(t("libraryError"));
  }

  return generateQrBlobFromLibrary(text);
}

function generateQrBlobFromLibrary(text) {
  return new Promise((resolve, reject) => {
    if (!window.QRCode || typeof window.QRCode !== "function") {
      reject(new Error("QRライブラリが利用できません。"));
      return;
    }

    const sandbox = document.createElement("div");
    sandbox.style.position = "fixed";
    sandbox.style.left = "-9999px";
    sandbox.style.top = "-9999px";
    document.body.appendChild(sandbox);

    try {
      new window.QRCode(sandbox, {
        text,
        width: 320,
        height: 320,
        colorDark: "#17212e",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.H
      });

      requestAnimationFrame(() => {
        const canvas = sandbox.querySelector("canvas");
        if (canvas) {
          canvas.toBlob((blob) => {
            cleanupSandbox(sandbox);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("QR生成後の画像化に失敗しました。"));
            }
          }, "image/png");
          return;
        }

        const image = sandbox.querySelector("img");
        if (image && image.src.startsWith("data:image/")) {
          try {
            const blob = dataUrlToBlob(image.src);
            cleanupSandbox(sandbox);
            resolve(blob);
          } catch {
            cleanupSandbox(sandbox);
            reject(new Error("QR画像データの変換に失敗しました。"));
          }
          return;
        }

        cleanupSandbox(sandbox);
        reject(new Error("QRコード描画結果を取得できませんでした。"));
      });
    } catch (error) {
      cleanupSandbox(sandbox);
      reject(error);
    }
  });
}

function cleanupSandbox(node) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(",");
  if (parts.length !== 2) {
    throw new Error("Invalid data URL");
  }

  const mimeMatch = parts[0].match(/data:(.*?);base64/);
  if (!mimeMatch) {
    throw new Error("Invalid mime type");
  }

  const mime = mimeMatch[1];
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

function renderBlobPreview(blob) {
  clearObjectUrl();
  currentObjectUrl = URL.createObjectURL(blob);

  const image = document.createElement("img");
  image.src = currentObjectUrl;
  image.alt = "生成されたQRコード";

  preview.innerHTML = "";
  preview.appendChild(image);
}

function clearObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function setStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#b0122f" : "#24427f";
}

function showPlaceholder() {
  preview.innerHTML = `<p class="qr-placeholder">${t("previewPlaceholder")}</p>`;
}

function disableOutputActions() {
  downloadBtn.disabled = true;
  copyBtn.disabled = true;
}

