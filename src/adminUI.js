// adminUI.js
// Dynamic UI Generator for Admin Dashboard
// Maintains Data-Driven Architecture - generates fields based on category schema
// XSS-SAFE: All dynamic content is escaped before insertion

class AdminUI {
    constructor() {
        this.schema = null;
        this.currentProduct = null;
        this.categoryFieldMap = null;
    }

    // Initialize and load schema
    async initialize() {
        try {
            // Load schema from data/schema.json
            const response = await fetch('data/schema.json');
            this.schema = await response.json();
            this.categoryFieldMap = this.schema.categoryFieldMap;
            console.log('[AdminUI] Schema loaded successfully');
            return true;
        } catch (error) {
            console.error('[AdminUI] Failed to load schema:', error);
            return false;
        }
    }

    // ==================== XSS PROTECTION ====================
    
    /**
     * Escape HTML to prevent XSS attacks
     * @private
     * @param {string} str - String to escape
     * @returns {string} Escaped HTML-safe string
     */
    _escapeHtml(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ==================== DYNAMIC FORM GENERATION ====================

    // Generate form fields based on product category
    generateCategoryFields(category, container, existingData = {}) {
        if (!this.categoryFieldMap || !this.categoryFieldMap[category]) {
            console.warn(`[AdminUI] No field mapping for category: ${category}`);
            return;
        }

        const config = this.categoryFieldMap[category];
        container.innerHTML = '';

        // Add category header
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
            <i class="fas ${config.icon}"></i>
            <span>${this._escapeHtml(config.label)} Attributes</span>
        `;
        container.appendChild(header);

        // Generate fields based on category configuration
        config.fields.forEach(field => {
            const fieldElement = this.createField(field, existingData[field.name]);
            container.appendChild(fieldElement);
        });

        return config;
    }

    createField(fieldConfig, existingValue) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = fieldConfig.label;
        wrapper.appendChild(label);

        let input;

        switch (fieldConfig.type) {
            case 'text':
                input = this.createTextInput(fieldConfig, existingValue);
                break;
            case 'number':
                input = this.createNumberInput(fieldConfig, existingValue);
                break;
            case 'select':
                input = this.createSelectInput(fieldConfig, existingValue);
                break;
            case 'checkbox':
                input = this.createCheckboxInput(fieldConfig, existingValue);
                break;
            case 'textarea':
                input = this.createTextareaInput(fieldConfig, existingValue);
                break;
            case 'multiNumber':
                input = this.createMultiNumberInput(fieldConfig, existingValue);
                break;
            case 'multiText':
                input = this.createMultiTextInput(fieldConfig, existingValue);
                break;
            default:
                input = this.createTextInput(fieldConfig, existingValue);
        }

        wrapper.appendChild(input);
        return wrapper;
    }

    createTextInput(config, value) {
        const input = document.createElement('input');
        input.type = 'text';
        input.name = `attr_${config.name}`;
        input.className = 'form-control';
        input.placeholder = config.placeholder || '';
        if (value) input.value = value;
        return input;
    }

    createNumberInput(config, value) {
        const input = document.createElement('input');
        input.type = 'number';
        input.name = `attr_${config.name}`;
        input.className = 'form-control';
        input.placeholder = config.placeholder || '';
        if (value !== undefined) input.value = value;
        return input;
    }

    createSelectInput(config, value) {
        const select = document.createElement('select');
        select.name = `attr_${config.name}`;
        select.className = 'form-control';

        config.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            if (value === option) opt.selected = true;
            select.appendChild(opt);
        });

        return select;
    }

    createCheckboxInput(config, value) {
        const wrapper = document.createElement('label');
        wrapper.className = 'checkbox-wrapper';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = `attr_${config.name}`;
        if (value) input.checked = true;

        const text = document.createElement('span');
        text.textContent = config.label;

        wrapper.appendChild(input);
        wrapper.appendChild(text);
        return wrapper;
    }

    createTextareaInput(config, value) {
        const textarea = document.createElement('textarea');
        textarea.name = `attr_${config.name}`;
        textarea.className = 'form-control';
        textarea.rows = 3;
        textarea.placeholder = config.placeholder || '';
        if (value) textarea.value = value;
        return textarea;
    }

    createMultiNumberInput(config, value) {
        const wrapper = document.createElement('div');
        wrapper.className = 'multi-input-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.name = `attr_${config.name}`;
        input.className = 'form-control';
        input.placeholder = config.placeholder || '3,4,5,6,7';
        
        if (Array.isArray(value)) {
            input.value = value.join(',');
        } else if (value) {
            input.value = value;
        }

        const hint = document.createElement('small');
        hint.className = 'input-hint';
        hint.textContent = 'Separate multiple values with commas';

        wrapper.appendChild(input);
        wrapper.appendChild(hint);
        return wrapper;
    }

    createMultiTextInput(config, value) {
        const wrapper = document.createElement('div');
        wrapper.className = 'multi-input-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.name = `attr_${config.name}`;
        input.className = 'form-control';
        input.placeholder = config.placeholder || 'Red,Blue,Green';
        
        if (Array.isArray(value)) {
            input.value = value.join(',');
        } else if (value) {
            input.value = value;
        }

        const hint = document.createElement('small');
        hint.className = 'input-hint';
        hint.textContent = 'Separate multiple values with commas';

        wrapper.appendChild(input);
        wrapper.appendChild(hint);
        return wrapper;
    }

    // Extract attributes from form based on category
    extractAttributesFromForm(category, formElement) {
        if (!this.categoryFieldMap[category]) return {};

        const attributes = {};
        const config = this.categoryFieldMap[category];

        config.fields.forEach(field => {
            const input = formElement.querySelector(`[name="attr_${field.name}"]`);
            if (!input) return;

            let value;
            if (field.type === 'checkbox') {
                value = input.checked;
            } else if (field.type === 'multiNumber') {
                value = input.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
            } else if (field.type === 'multiText') {
                value = input.value.split(',').map(v => v.trim()).filter(v => v);
            } else if (field.type === 'number') {
                value = parseFloat(input.value) || 0;
            } else {
                value = input.value;
            }

            attributes[field.name] = value;
        });

        return attributes;
    }

    // ==================== PRODUCT TABLE GENERATION ====================

    generateProductTable(products, container, options = {}) {
        const { onEdit, onDelete, onToggleVisibility, onBulkAction } = options;

        container.innerHTML = '';

        if (!products.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>No products found</p>
                </div>
            `;
            return;
        }

        const table = document.createElement('table');
        table.className = 'admin-table';

        // Header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th><input type="checkbox" id="selectAll"></th>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
            </tr>
        `;
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        products.forEach(product => {
            const row = this.createProductRow(product, { onEdit, onDelete, onToggleVisibility });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        container.appendChild(table);

        // Add bulk action toolbar
        if (onBulkAction) {
            const toolbar = this.createBulkActionToolbar(onBulkAction);
            container.insertBefore(toolbar, table);
        }

        // Setup select all checkbox
        const selectAll = table.querySelector('#selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                table.querySelectorAll('.row-checkbox').forEach(cb => {
                    cb.checked = e.target.checked;
                });
            });
        }
    }

    createProductRow(product, callbacks) {
        const row = document.createElement('tr');
        row.dataset.productId = product.id;

        const statusConfig = AdminConfig.inventoryStatuses.find(s => s.value === product.inventoryStatus) || 
                            { label: 'Unknown', color: '#999' };

        const categoryConfig = this.categoryFieldMap?.[product.category] || { label: product.category, icon: 'fa-box' };
        
        // Escape all dynamic content to prevent XSS
        const safeName = this._escapeHtml(product.name);
        const safeId = this._escapeHtml(product.id);
        const safeNotes = product.adminNotes ? this._escapeHtml(product.adminNotes) : '';
        const safeUpdatedBy = this._escapeHtml(product.updatedBy || 'Unknown');
        const safeCategoryLabel = this._escapeHtml(categoryConfig.label);
        const safeStatusLabel = this._escapeHtml(statusConfig.label);

        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" value="${safeId}"></td>
            <td>
                <img src="${product.images?.[0] || 'assets/placeholder.jpg'}" 
                     alt="${safeName}" 
                     class="product-thumb"
                     onerror="this.src='assets/placeholder.jpg'">
            </td>
            <td>
                <div class="product-info">
                    <strong>${safeName}</strong>
                    <span class="product-id">${safeId}</span>
                    ${safeNotes ? `<i class="fas fa-sticky-note note-indicator" title="${safeNotes}"></i>` : ''}
                </div>
            </td>
            <td>
                <span class="category-badge">
                    <i class="fas ${categoryConfig.icon}"></i>
                    ${safeCategoryLabel}
                </span>
            </td>
            <td>R ${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.stockQuantity || 0}</td>
            <td>
                <span class="status-badge" style="background: ${statusConfig.color}">
                    ${safeStatusLabel}
                </span>
            </td>
            <td>
                <div class="update-info">
                    <span>${this.formatDate(product.lastUpdated)}</span>
                    <small>by ${safeUpdatedBy}</small>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-visibility ${product.isVisible ? 'visible' : 'hidden'}" title="Toggle Visibility">
                        <i class="fas ${product.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    </button>
                    <button class="btn-icon btn-delete" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Bind events
        const editBtn = row.querySelector('.btn-edit');
        const visibilityBtn = row.querySelector('.btn-visibility');
        const deleteBtn = row.querySelector('.btn-delete');

        if (callbacks.onEdit) {
            editBtn.addEventListener('click', () => callbacks.onEdit(product));
        }

        if (callbacks.onToggleVisibility) {
            visibilityBtn.addEventListener('click', () => callbacks.onToggleVisibility(product));
        }

        if (callbacks.onDelete) {
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete "${safeName}"?`)) {
                    callbacks.onDelete(product);
                }
            });
        }

        return row;
    }

    createBulkActionToolbar(onBulkAction) {
        const toolbar = document.createElement('div');
        toolbar.className = 'bulk-actions-toolbar';
        toolbar.innerHTML = `
            <span class="selected-count">0 selected</span>
            <select class="bulk-action-select">
                <option value="">Bulk Actions...</option>
                <option value="inStock">Mark as In Stock</option>
                <option value="lowStock">Mark as Low Stock</option>
                <option value="outOfStock">Mark as Out of Stock</option>
                <option value="toggleVisibility">Toggle Visibility</option>
                <option value="delete">Delete</option>
            </select>
            <button class="btn btn-secondary apply-bulk">Apply</button>
        `;

        const select = toolbar.querySelector('.bulk-action-select');
        const applyBtn = toolbar.querySelector('.apply-bulk');
        const countSpan = toolbar.querySelector('.selected-count');

        // Update count when checkboxes change
        const updateCount = () => {
            const selected = document.querySelectorAll('.row-checkbox:checked').length;
            countSpan.textContent = `${selected} selected`;
            toolbar.style.display = selected > 0 ? 'flex' : 'none';
        };

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-checkbox') || e.target.id === 'selectAll') {
                updateCount();
            }
        });

        applyBtn.addEventListener('click', () => {
            const action = select.value;
            if (!action) return;

            const selectedIds = Array.from(document.querySelectorAll('.row-checkbox:checked'))
                .map(cb => cb.value);

            if (selectedIds.length === 0) {
                alert('Please select at least one product');
                return;
            }

            onBulkAction(action, selectedIds);
        });

        toolbar.style.display = 'none';
        return toolbar;
    }

    // ==================== MODAL DIALOGS ====================

    showProductModal(product = null, onSave) {
        const isEdit = !!product;
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.id = 'productModal';
        
        // Escape values for safe insertion
        const safeId = this._escapeHtml(product?.id || '');
        const safeName = this._escapeHtml(product?.name || '');
        const safeDesc = this._escapeHtml(product?.description || '');
        const safeNotes = this._escapeHtml(product?.adminNotes || '');

        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${isEdit ? 'Edit Product' : 'Add New Product'}</h2>
                    <button class="btn-close">&times;</button>
                </div>
                <form class="product-form">
                    <div class="form-grid">
                        <div class="form-section">
                            <h3>Basic Information</h3>
                            
                            <div class="form-group">
                                <label>Product ID</label>
                                <input type="text" name="id" class="form-control" 
                                       value="${safeId}" 
                                       ${isEdit ? 'readonly' : ''}
                                       placeholder="auto-generated if empty">
                            </div>

                            <div class="form-group">
                                <label>Name *</label>
                                <input type="text" name="name" class="form-control" 
                                       value="${safeName}" required>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Price (R) *</label>
                                    <input type="number" name="price" class="form-control" 
                                           value="${product?.price || ''}" step="0.01" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label>Category *</label>
                                    <select name="category" class="form-control" required>
                                        ${this.generateCategoryOptions(product?.category)}
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Description</label>
                                <textarea name="description" class="form-control" rows="3">${safeDesc}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Tag</label>
                                <select name="tag" class="form-control">
                                    ${this.generateTagOptions(product?.tag)}
                                </select>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Inventory & Admin</h3>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Stock Quantity</label>
                                    <input type="number" name="stockQuantity" class="form-control" 
                                           value="${product?.stockQuantity || '10'}" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Status</label>
                                    <select name="inventoryStatus" class="form-control">
                                        ${this.generateStatusOptions(product?.inventoryStatus)}
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="checkbox-wrapper">
                                    <input type="checkbox" name="isVisible" 
                                           ${product?.isVisible !== false ? 'checked' : ''}>
                                    <span>Visible on Storefront</span>
                                </label>
                            </div>

                            <div class="form-group">
                                <label>Admin Notes</label>
                                <textarea name="adminNotes" class="form-control" rows="3" 
                                          placeholder="Internal notes...">${safeNotes}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Images</label>
                                <div class="image-upload-area">
                                    <input type="file" name="images" multiple accept="image/*" class="file-input">
                                    <div class="upload-hint">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <span>Drop images here or click to upload</span>
                                    </div>
                                </div>
                                <div class="image-preview-container">
                                    ${this.generateImagePreviews(product?.images || [])}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-section category-attributes">
                        <h3>Category-Specific Attributes</h3>
                        <div class="dynamic-fields">
                            <p class="placeholder-text">Select a category to see specific attributes</p>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary btn-cancel">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} Product</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup category change handler for dynamic fields
        const categorySelect = modal.querySelector('[name="category"]');
        const dynamicFields = modal.querySelector('.dynamic-fields');

        const updateDynamicFields = () => {
            const category = categorySelect.value;
            if (category) {
                const attributes = product?.attributes || {};
                this.generateCategoryFields(category, dynamicFields, attributes);
            }
        };

        categorySelect.addEventListener('change', updateDynamicFields);
        
        // Initialize if editing
        if (product?.category) {
            updateDynamicFields();
        }

        // Setup image upload preview
        const fileInput = modal.querySelector('.file-input');
        const previewContainer = modal.querySelector('.image-preview-container');

        fileInput.addEventListener('change', (e) => {
            this.handleImagePreview(e.target.files, previewContainer);
        });

        // Close handlers
        const closeModal = () => modal.remove();
        modal.querySelector('.btn-close').addEventListener('click', closeModal);
        modal.querySelector('.btn-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Form submission
        const form = modal.querySelector('.product-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const productData = this.extractFormData(form, dynamicFields);
            
            // Include files for upload
            const files = fileInput.files;
            
            await onSave(productData, files);
            closeModal();
        });

        return modal;
    }

    generateCategoryOptions(selected) {
        if (!this.categoryFieldMap) return '';
        
        return Object.entries(this.categoryFieldMap).map(([key, config]) => `
            <option value="${key}" ${selected === key ? 'selected' : ''}>
                ${this._escapeHtml(config.label)}
            </option>
        `).join('');
    }

    generateTagOptions(selected) {
        return AdminConfig.tags.map(tag => `
            <option value="${tag}" ${selected === tag ? 'selected' : ''}>${this._escapeHtml(tag)}</option>
        `).join('');
    }

    generateStatusOptions(selected) {
        return AdminConfig.inventoryStatuses.map(status => `
            <option value="${status.value}" ${selected === status.value ? 'selected' : ''}>
                ${this._escapeHtml(status.label)}
            </option>
        `).join('');
    }

    generateImagePreviews(images) {
        if (!images.length) return '';
        
        return images.map((img, idx) => `
            <div class="image-preview">
                <img src="${this._escapeHtml(img)}" alt="Product ${idx + 1}">
                <button type="button" class="btn-remove-image" data-index="${idx}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    handleImagePreview(files, container) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview new';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <span class="new-badge">New</span>
                `;
                container.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    }

    extractFormData(form, dynamicFieldsContainer) {
        const data = {
            id: form.querySelector('[name="id"]').value,
            name: form.querySelector('[name="name"]').value,
            price: parseFloat(form.querySelector('[name="price"]').value),
            category: form.querySelector('[name="category"]').value,
            description: form.querySelector('[name="description"]').value,
            tag: form.querySelector('[name="tag"]').value,
            stockQuantity: parseInt(form.querySelector('[name="stockQuantity"]').value) || 0,
            inventoryStatus: form.querySelector('[name="inventoryStatus"]').value,
            isVisible: form.querySelector('[name="isVisible"]').checked,
            adminNotes: form.querySelector('[name="adminNotes"]').value,
            attributes: this.extractAttributesFromForm(
                form.querySelector('[name="category"]').value,
                dynamicFieldsContainer
            )
        };

        // Keep existing images if editing
        const existingImages = form.querySelectorAll('.image-preview:not(.new) img');
        data.images = Array.from(existingImages).map(img => img.src);

        return data;
    }

    // ==================== UTILITY METHODS ====================

    formatDate(dateString) {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // Less than 24 hours
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            if (hours < 1) return 'Just now';
            return `${hours}h ago`;
        }
        
        // Less than 7 days
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            return `${days}d ago`;
        }
        
        return date.toLocaleDateString('en-ZA');
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer') || document.body;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${this._escapeHtml(message)}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    showLoading(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
                <span>${this._escapeHtml(message)}</span>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    hideLoading(overlay) {
        if (overlay) overlay.remove();
    }
}

// Create global instance
const adminUI = new AdminUI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminUI, adminUI };
}
