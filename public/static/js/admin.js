document.querySelectorAll("[data-delete-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (!window.confirm("Delete this exhibit? This removes its Markdown file.")) event.preventDefault();
  });
});

const categorySelect = document.querySelector("[data-category-select]");
if (categorySelect) {
  const newCategoryField = document.querySelector("[data-new-category-field]");
  const newCategoryInput = document.querySelector("[data-new-category-input]");
  const updateCategoryField = (focusInput = false) => {
    const addingCategory = categorySelect.value === "__new__";
    newCategoryField.hidden = !addingCategory;
    newCategoryInput.required = addingCategory;
    if (addingCategory && focusInput) newCategoryInput.focus();
  };
  categorySelect.addEventListener("change", () => updateCategoryField(true));
  updateCategoryField();
}

const visualEditor = document.querySelector("[data-visual-editor]");
if (visualEditor) {
  const form = visualEditor.closest("form");
  const markdownField = form.querySelector("#body-markdown");
  let uploadedImagePreview = "";

  const safeLink = (value) => {
    try {
      const url = new URL(value, window.location.origin);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? value : "";
    } catch {
      return "";
    }
  };

  const inlineMarkdown = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const inner = Array.from(node.childNodes, inlineMarkdown).join("");
    switch (node.tagName) {
      case "STRONG": case "B": return `**${inner}**`;
      case "EM": case "I": return `*${inner}*`;
      case "CODE": return `\`${inner}\``;
      case "A": {
        const href = safeLink(node.getAttribute("href") || "");
        return href ? `[${inner}](${href})` : inner;
      }
      case "BR": return "\n";
      default: return inner;
    }
  };

  const blockMarkdown = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue.trim() ? node.nodeValue.trim() : "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const inner = Array.from(node.childNodes, inlineMarkdown).join("").trim();
    switch (node.tagName) {
      case "H1": case "H2": return inner ? `## ${inner}` : "";
      case "H3": return inner ? `### ${inner}` : "";
      case "UL": return Array.from(node.children).map((item) => `- ${Array.from(item.childNodes, inlineMarkdown).join("").trim()}`).join("\n");
      case "OL": return Array.from(node.children).map((item) => `- ${Array.from(item.childNodes, inlineMarkdown).join("").trim()}`).join("\n");
      case "PRE": return `\`\`\`\n${node.textContent.replace(/\n+$/, "")}\n\`\`\``;
      case "P": case "DIV": case "LI": return inner;
      default: return inner;
    }
  };

  const updateMarkdown = () => {
    markdownField.value = Array.from(visualEditor.childNodes, blockMarkdown).filter(Boolean).join("\n\n").trim();
  };

  const updateImage = () => {
    const imagePath = form.elements.image.value.trim();
    const figure = form.querySelector("[data-editor-figure]");
    const image = form.querySelector("[data-editor-image]");
    const safeImage = safeLink(imagePath);
    const showImage = uploadedImagePreview || (safeImage && ["http:", "https:"].includes(new URL(safeImage, window.location.origin).protocol) ? new URL(safeImage, window.location.origin).href : "");
    figure.hidden = !showImage;
    if (showImage) image.src = showImage;
  };

  document.querySelectorAll("[data-format]").forEach((button) => {
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      visualEditor.focus();
      const format = button.dataset.format;
      if (format === "link") {
        const href = window.prompt("Enter a web or email link:", "https://");
        if (href && safeLink(href)) document.execCommand("createLink", false, href);
      } else if (format === "ul") {
        document.execCommand("insertUnorderedList");
      } else if (format === "pre") {
        document.execCommand("formatBlock", false, "pre");
      } else if (["p", "h2", "h3"].includes(format)) {
        document.execCommand("formatBlock", false, format);
      } else {
        document.execCommand(format === "bold" ? "bold" : "italic");
      }
      updateMarkdown();
    });
  });

  const imageUpload = form.querySelector('input[type="file"][name="image_upload"]');
  imageUpload.addEventListener("change", () => {
    if (uploadedImagePreview) URL.revokeObjectURL(uploadedImagePreview);
    uploadedImagePreview = imageUpload.files[0] ? URL.createObjectURL(imageUpload.files[0]) : "";
    updateImage();
  });
  form.addEventListener("paste", (event) => {
    const imageItem = Array.from(event.clipboardData?.items || []).find((item) => item.type.startsWith("image/"));
    const imageFile = imageItem?.getAsFile();
    if (!imageFile) return;
    event.preventDefault();
    const pasteTarget = form.querySelector(".screenshot-paste-target");
    if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
      pasteTarget.textContent = "Use a JPEG, PNG, or WebP screenshot.";
      return;
    }
    const extension = imageFile.type === "image/jpeg" ? "jpg" : imageFile.type.slice("image/".length);
    const transfer = new DataTransfer();
    transfer.items.add(new File([imageFile], `pasted-screenshot.${extension}`, { type: imageFile.type }));
    imageUpload.files = transfer.files;
    imageUpload.dispatchEvent(new Event("change", { bubbles: true }));
    pasteTarget.textContent = "Screenshot added. Paste another image here or choose a file.";
  });
  form.elements.image.addEventListener("input", updateImage);
  visualEditor.addEventListener("input", updateMarkdown);
  form.addEventListener("submit", (event) => {
    updateMarkdown();
    if (!markdownField.value) {
      event.preventDefault();
      visualEditor.focus();
      window.alert("Add some exhibit content before saving.");
    }
  });
  updateMarkdown();
  updateImage();
}
