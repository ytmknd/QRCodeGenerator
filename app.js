const textInput = document.getElementById("qr-text");
const preview = document.getElementById("qr-preview");
const statusEl = document.getElementById("status");
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const copyBtn = document.getElementById("copy-btn");

let currentImageBlob = null;
let currentObjectUrl = null;

showPlaceholder();

generateBtn.addEventListener("click", handleGenerate);
clearBtn.addEventListener("click", handleClear);
downloadBtn.addEventListener("click", handleDownload);
copyBtn.addEventListener("click", handleCopyImage);

textInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    handleGenerate();
  }
});

async function handleGenerate() {
  const text = textInput.value.trim();

  if (!text) {
    setStatus("入力内容が空です。テキストまたはURLを入力してください。", true);
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
    setStatus("QRコードを生成しました。", false);
  } catch (error) {
    console.error(error);
    currentImageBlob = null;
    disableOutputActions();
    showPlaceholder();
    const details = error instanceof Error ? error.message : "不明なエラー";
    setStatus(`QRコードの生成に失敗しました。${details}`, true);
  }
}

function handleClear() {
  textInput.value = "";
  clearObjectUrl();
  currentImageBlob = null;
  disableOutputActions();
  showPlaceholder();
  setStatus("入力をクリアしました。", false);
}

function handleDownload() {
  if (!currentImageBlob) {
    setStatus("先にQRコードを生成してください。", true);
    return;
  }

  const link = document.createElement("a");
  const url = URL.createObjectURL(currentImageBlob);
  link.href = url;
  link.download = "qr-code.png";
  link.click();
  URL.revokeObjectURL(url);

  setStatus("QRコード画像をダウンロードしました。", false);
}

async function handleCopyImage() {
  if (!currentImageBlob) {
    setStatus("先にQRコードを生成してください。", true);
    return;
  }

  if (!navigator.clipboard || !window.ClipboardItem) {
    setStatus("このブラウザは画像のクリップボードコピーに対応していません。", true);
    return;
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": currentImageBlob
      })
    ]);
    setStatus("QRコード画像をクリップボードにコピーしました。", false);
  } catch (error) {
    console.error(error);
    setStatus("コピーに失敗しました。HTTPS環境か権限設定を確認してください。", true);
  }
}

async function generateQrBlob(text) {
  if (!window.QRCode || typeof window.QRCode !== "function") {
    throw new Error("QRライブラリの読み込みに失敗しました。ページを再読み込みしてください。");
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
  preview.innerHTML = '<p class="qr-placeholder">ここにQRコードが表示されます</p>';
}

function disableOutputActions() {
  downloadBtn.disabled = true;
  copyBtn.disabled = true;
}

