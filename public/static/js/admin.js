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

const tagInput = document.querySelector("[data-tag-autocomplete] #page-tags");
if (tagInput) {
  const suggestions = document.querySelector("#tag-suggestions");
  const existingTags = Array.from(document.querySelectorAll("#existing-tags option"), (option) => option.value);
  let matches = [];
  let activeIndex = -1;

  const hideSuggestions = () => {
    suggestions.hidden = true;
    suggestions.replaceChildren();
    tagInput.setAttribute("aria-expanded", "false");
    tagInput.removeAttribute("aria-activedescendant");
    matches = [];
    activeIndex = -1;
  };

  const chooseTag = (tag) => {
    const comma = tagInput.value.lastIndexOf(",");
    const prefix = comma === -1 ? "" : tagInput.value.slice(0, comma + 1);
    const spacer = prefix && !/\s$/.test(prefix) ? " " : "";
    tagInput.value = `${prefix}${spacer}${tag}, `;
    tagInput.focus();
    tagInput.setSelectionRange(tagInput.value.length, tagInput.value.length);
    tagInput.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const updateActiveOption = () => {
    Array.from(suggestions.children).forEach((option, index) => {
      option.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
    });
    if (activeIndex >= 0) tagInput.setAttribute("aria-activedescendant", `tag-suggestion-${activeIndex}`);
    else tagInput.removeAttribute("aria-activedescendant");
  };

  tagInput.addEventListener("input", () => {
    const comma = tagInput.value.lastIndexOf(",");
    const query = tagInput.value.slice(comma + 1).trim();
    const alreadyAdded = (comma === -1 ? "" : tagInput.value.slice(0, comma))
      .split(",").map((tag) => tag.trim().toLocaleLowerCase()).filter(Boolean);
    const normalizedQuery = query.toLocaleLowerCase();
    matches = query === "" ? [] : existingTags
      .filter((tag) => tag.toLocaleLowerCase().startsWith(normalizedQuery) && !alreadyAdded.includes(tag.toLocaleLowerCase()))
      .slice(0, 8);
    suggestions.replaceChildren();
    activeIndex = -1;
    matches.forEach((tag, index) => {
      const option = document.createElement("li");
      option.id = `tag-suggestion-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.textContent = tag;
      option.addEventListener("mousedown", (event) => event.preventDefault());
      option.addEventListener("click", () => chooseTag(tag));
      suggestions.append(option);
    });
    suggestions.hidden = matches.length === 0;
    tagInput.setAttribute("aria-expanded", matches.length > 0 ? "true" : "false");
  });

  tagInput.addEventListener("keydown", (event) => {
    if (suggestions.hidden) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      activeIndex = activeIndex < 0
        ? (direction === 1 ? 0 : matches.length - 1)
        : (activeIndex + direction + matches.length) % matches.length;
      updateActiveOption();
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      chooseTag(matches[activeIndex]);
    } else if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  tagInput.addEventListener("blur", () => window.setTimeout(hideSuggestions, 120));
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
