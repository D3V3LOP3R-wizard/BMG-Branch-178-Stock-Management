  // Tab switching functionality
        function switchTab(tabName, el) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content and activate tab
            document.getElementById(tabName).classList.add('active');
            if (el && el.classList) el.classList.add('active');
        }
        
        // Handle barcode entry
        function handleBarcodeEntry(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const barcodeInput = document.getElementById('barcode');
                const barcode = barcodeInput.value.trim();
                
                if (barcode) {
                    simulateScan(barcode);
                    barcodeInput.value = '';
                } else if (e.key === ' ') {
                    // Simulate a scan with a random barcode
                    const barcodes = ['BMG-7821', 'BMG-4390', 'BMG-5567', 'BMG-9123', 'BMG-3345'];
                    const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
                    simulateScan(randomBarcode);
                }
            }
        }
        
        // Simulate barcode scan
        function simulateScan(barcode) {
            const scannerDiv = document.querySelector('.qr-scanner');
            const originalHTML = scannerDiv.innerHTML;
            
            // Show scanning animation
            scannerDiv.innerHTML = `
                <i class="fas fa-search" style="color: var(--secondary-color); animation: pulse 1s infinite;"></i>
                <h3>Scanning...</h3>
                <p>Barcode: ${barcode}</p>
                <div class="scan-instruction">Item found and counted</div>
            `;
            
            // Add CSS for pulse animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
            
            // Play beep sound (simulated)
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.start();
            setTimeout(() => oscillator.stop(), 100);
            
            // Return to normal after 1.5 seconds
            setTimeout(() => {
                scannerDiv.innerHTML = originalHTML;
                
                // Update the count for the scanned item in the table
                updateCountForItem(barcode);
            }, 1500);
        }
        
        // Update count for scanned item
        function updateCountForItem(barcode) {
            const rows = document.querySelectorAll('#count-table tr');
            for (let row of rows) {
                const cells = row.querySelectorAll('td');
                if (cells.length > 0 && cells[0].textContent === barcode) {
                    const countInput = cells[3].querySelector('input');
                    if (countInput) {
                        // safely parse the current input value (fallback to 0)
                        const currentCount = parseInt(countInput.value, 10) || 0;
                        countInput.value = currentCount + 1;
                    
                    // Update variance
                    const expectedQty = parseInt(cells[2].textContent, 10) || 0;
                    const varianceCell = cells[4];
                    const newVariance = (currentCount + 1) - expectedQty;
                    varianceCell.textContent = newVariance;
                    
                    // Update status
                    const statusCell = cells[5];
                    statusCell.innerHTML = '';
                    let badgeClass = 'success';
                    let badgeText = 'Match';
                    
                    if (newVariance === 0) {
                        badgeClass = 'success';
                        badgeText = 'Match';
                    } else if (Math.abs(newVariance) <= 5) {
                        badgeClass = 'warning';
                        badgeText = 'Minor Diff';
                    } else {
                        badgeClass = 'danger';
                        badgeText = 'Major Diff';
                    }
                    
                    const badge = document.createElement('span');
                    badge.className = `badge ${badgeClass}`;
                    badge.textContent = badgeText;
                    statusCell.appendChild(badge);
                    
                    // Highlight row briefly
                    row.style.backgroundColor = '#e8f5e9';
                    setTimeout(() => {
                        row.style.backgroundColor = '';
                    }, 1000);
                    
                    break;
                }
            }
        }

    }
        
        // Complete stock take
        function completeStockTake() {
            const rows = document.querySelectorAll('#count-table tr');
            let totalVariance = 0;
            let itemsWithVariance = 0;
            
            for (let row of rows) {
                const cells = row.querySelectorAll('td');
                const variance = parseInt(cells[4].textContent, 10) || 0;
                
                if (variance !== 0) {
                    totalVariance += Math.abs(variance);
                    itemsWithVariance++;
                }
            }
            
            // Show confirmation modal
            showModal(`
                <h3><i class="fas fa-check-circle" style="color: var(--success-color);"></i> Stock Take Complete</h3>
                <p>Stock take has been successfully completed and saved.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Summary:</strong></p>
                    <p>Items counted: ${rows.length}</p>
                    <p>Items with variance: ${itemsWithVariance}</p>
                    <p>Total variance: ${totalVariance} units</p>
                </div>
                <p>An audit trail has been created and the inventory has been updated.</p>
            `);
            
            // Update dashboard stats
            updateDashboardStats();
        }
        
        // Save stock take as draft
        function saveDraft() {
            showModal(`
                <h3><i class="fas fa-save" style="color: var(--primary-color);"></i> Draft Saved</h3>
                <p>Your stock take progress has been saved as a draft.</p>
                <p>You can return to complete it later from the "Pending Counts" section.</p>
            `);
        }
        
        // Print count sheet
        function printCountSheet() {
            showModal(`
                <h3><i class="fas fa-print" style="color: var(--dark-color);"></i> Print Count Sheet</h3>
                <p>Generating printable count sheet...</p>
                <p>Open the print dialog to print the count sheet for physical verification.</p>
                <div style="margin-top: 20px;">
                    <button class="btn" onclick="window.print(); closeModal();">Print Now</button>
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            `);
        }
        
        // Add new inventory item
        function addNewItem() {
            showModal(`
                <h3><i class="fas fa-plus" style="color: var(--primary-color);"></i> Add New Inventory Item</h3>
                <form id="new-item-form">
                    <div class="form-group">
                        <label for="item-name">Item Name</label>
                        <input type="text" id="item-name" required>
                    </div>
                    <div class="form-group">
                        <label for="item-category">Category</label>
                        <select id="item-category" required>
                            <option value="">Select Category</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Tools">Tools</option>
                            <option value="Safety">Safety Equipment</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="initial-stock">Initial Stock Quantity</label>
                        <input type="number" id="initial-stock" min="0" value="0" required>
                    </div>
                    <div class="form-group">
                        <label for="reorder-point">Reorder Point</label>
                        <input type="number" id="reorder-point" min="0" value="10" required>
                    </div>
                    <div class="form-group">
                        <label for="item-location">Storage Location</label>
                        <input type="text" id="item-location" placeholder="e.g., Aisle 3, Shelf B">
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" class="btn btn-success">Add Item</button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    </div>
                </form>
            `);
            
            // Handle form submission
            document.getElementById('new-item-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Generate a new item code
                const newItemCode = 'BMG-' + Math.floor(1000 + Math.random() * 9000);
                
                showModal(`
                    <h3><i class="fas fa-check-circle" style="color: var(--success-color);"></i> Item Added Successfully</h3>
                    <p>New inventory item has been added with code: <strong>${newItemCode}</strong></p>
                    <p>Don't forget to print barcode labels for the new item.</p>
                    <div style="margin-top: 20px;">
                        <button class="btn" onclick="printBarcode('${newItemCode}')">Print Barcode</button>
                        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                    </div>
                `);
            });
        }
        
        // Print barcode for item
        function printBarcode(itemCode) {
            showModal(`
                <h3><i class="fas fa-barcode" style="color: var(--dark-color);"></i> Print Barcode Label</h3>
                <p>Printing barcode label for item: <strong>${itemCode}</strong></p>
                <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-family: 'Libre Barcode 128', monospace; font-size: 40px; letter-spacing: 5px;">
                        ${itemCode}
                    </div>
                    <div style="margin-top: 10px; font-size: 14px;">${itemCode}</div>
                </div>
                <p>Ensure the barcode scanner can read this format before printing multiple labels.</p>
                <div style="margin-top: 20px;">
                    <button class="btn" onclick="window.print();">Print Label</button>
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                </div>
            `);
        }
        
        // Export inventory data
        function exportInventory() {
            showModal(`
                <h3><i class="fas fa-file-export" style="color: var(--primary-color);"></i> Export Inventory Data</h3>
                <p>Select the format for export:</p>
                <div style="display: flex; flex-direction: column; gap: 10px; margin: 20px 0;">
                    <button class="btn" onclick="exportToFormat('csv')"><i class="fas fa-file-csv"></i> Export as CSV</button>
                    <button class="btn" onclick="exportToFormat('excel')"><i class="fas fa-file-excel"></i> Export as Excel</button>
                    <button class="btn" onclick="exportToFormat('pdf')"><i class="fas fa-file-pdf"></i> Export as PDF</button>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            `);
        }
        
        // Export to specific format
        function exportToFormat(format) {
            showModal(`
                <h3><i class="fas fa-download" style="color: var(--success-color);"></i> Exporting Data</h3>
                <p>Your inventory data is being exported as ${format.toUpperCase()}...</p>
                <p>Download will begin shortly. File name: <strong>BMG178_Inventory_${new Date().toISOString().slice(0,10)}.${format}</strong></p>
                <div style="margin-top: 20px;">
                    <button class="btn" onclick="closeModal()">Close</button>
                </div>
            `);
            
            // Simulate download delay
            setTimeout(() => {
                alert(`Your ${format.toUpperCase()} file is ready for download.`);
            }, 1500);
        }
        
        // Generate reports
        function generateReport(type) {
            const reportTitles = {
                'shrinkage': 'Shrinkage Analysis Report',
                'stock-levels': 'Stock Levels Report',
                'discrepancies': 'Discrepancy Report',
                'audit-trail': 'Audit Trail Report',
                'monthly': 'Monthly Summary Report'
            };
            
            showModal(`
                <h3><i class="fas fa-file-alt" style="color: var(--primary-color);"></i> ${reportTitles[type] || 'Report'}</h3>
                <p>Generating ${reportTitles[type].toLowerCase()}...</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Report Details:</strong></p>
                    <p>Period: Last 30 days</p>
                    <p>Branch: BMG 178</p>
                    <p>Generated: ${new Date().toLocaleDateString()}</p>
                </div>
                <p>The report will be available in the reports section and sent to your email.</p>
                <div style="margin-top: 20px;">
                    <button class="btn" onclick="downloadReport('${type}')">Download Report</button>
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                </div>
            `);
        }
        
        // Download report
        function downloadReport(type) {
            alert(`The ${type.replace('-', ' ')} report has been downloaded.`);
            closeModal();
        }
        
        // View access logs
        function viewAccessLogs() {
            showModal(`
                <h3><i class="fas fa-user-lock" style="color: var(--primary-color);"></i> Stockroom Access Logs</h3>
                <p>Access logs for the past 7 days:</p>
                <div style="max-height: 300px; overflow-y: auto; margin: 15px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 10px; text-align: left;">Date/Time</th>
                                <th style="padding: 10px; text-align: left;">Personnel</th>
                                <th style="padding: 10px; text-align: left;">Access Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>2023-10-15 08:32</td><td>Mpho</td><td>Entry</td></tr>
                            <tr><td>2023-10-15 10:15</td><td>David</td><td>Entry</td></tr>
                            <tr><td>2023-10-15 12:45</td><td>Enrique</td><td>Exit</td></tr>
                            <tr><td>2023-10-14 09:10</td><td>Thulani</td><td>Entry</td></tr>
                            <tr><td>2023-10-14 11:30</td><td>Tylon</td><td>Exit</td></tr>
                            <tr><td>2023-10-13 14:20</td><td>Siboniso</td><td>Entry</td></tr>
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn" onclick="exportAccessLogs()">Export Logs</button>
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                </div>
            `);
        }
        
        // Export access logs
        function exportAccessLogs() {
            alert('Access logs exported successfully.');
            closeModal();
        }
        
        // Schedule audit
        function scheduleAudit() {
            showModal(`
                <h3><i class="fas fa-calendar-alt" style="color: var(--primary-color);"></i> Schedule Stock Audit</h3>
                <form id="audit-form">
                    <div class="form-group">
                        <label for="audit-type">Audit Type</label>
                        <select id="audit-type" required>
                            <option value="full">Full Inventory Audit</option>
                            <option value="partial">Partial Audit (High-Value Items)</option>
                            <option value="spot">Spot Check</option>
                            <option value="cycle">Cycle Count</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="audit-date">Scheduled Date</label>
                        <input type="date" id="audit-date" value="${new Date().toISOString().slice(0,10)}" required>
                    </div>
                    <div class="form-group">
                        <label for="audit-team">Audit Team</label>
                        <select id="audit-team" multiple style="height: 100px;">
                            <option value="john" selected>John</option>
                            <option value="sarah" selected>Sarah</option>
                            <option value="mike">Jerry</option>
                            <option value="lisa">Lisa</option>
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple team members</small>
                    </div>
                    <div class="form-group">
                        <label for="audit-notes">Notes/Instructions</label>
                        <textarea id="audit-notes" rows="3" placeholder="Any special instructions for the audit team..."></textarea>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" class="btn btn-success">Schedule Audit</button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    </div>
                </form>
            `);
            
            document.getElementById('audit-form').addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Audit scheduled successfully. Notifications have been sent to the audit team.');
                closeModal();
            });
        }
        
        // Run stock reconciliation
        function runReconciliation() {
            showModal(`
                <h3><i class="fas fa-cog fa-spin" style="color: var(--primary-color);"></i> Running Stock Reconciliation</h3>
                <p>Comparing physical counts with system records...</p>
                <div id="reconciliation-progress" style="margin: 20px 0;">
                    <div style="width: 100%; background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div id="progress-bar" style="width: 0%; background: var(--primary-color); height: 100%; transition: width 1s;"></div>
                    </div>
                    <p id="progress-text" style="text-align: center; margin-top: 10px;">Starting...</p>
                </div>
                <div id="reconciliation-results" style="display: none;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p><strong>Reconciliation Complete</strong></p>
                        <p>Items processed: 1,247</p>
                        <p>Discrepancies found: 12 (0.96%)</p>
                        <p>Total variance value: R5,121.00</p>
                    </div>
                    <p>Discrepancy report has been generated and sent to management.</p>
                </div>
            `);
            
            // Simulate reconciliation progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) progress = 100;
                
                document.getElementById('progress-bar').style.width = progress + '%';
                document.getElementById('progress-text').textContent = 
                    `Processing... ${Math.round(progress)}% complete`;
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    document.getElementById('progress-text').textContent = 'Complete!';
                    document.getElementById('reconciliation-results').style.display = 'block';
                    
                    // Add a button to close
                    const modalContent = document.querySelector('.modal-content');
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'btn btn-secondary';
                    closeBtn.textContent = 'Close';
                    closeBtn.style.marginTop = '20px';
                    closeBtn.onclick = closeModal;
                    modalContent.appendChild(closeBtn);
                }
            }, 300);
        }
        
        // Update loss prevention checklist
        function updateChecklist() {
            alert('Loss prevention checklist updated successfully.');
        }
        
        // Update dashboard statistics
        function updateDashboardStats() {
            // In a real application, this would fetch data from the server
            // For now, we'll simulate some random changes
            const accuracyStat = document.querySelector('.dashboard .card:nth-child(2) .stat');
            const currentAccuracy = parseFloat(accuracyStat.textContent);
            const newAccuracy = Math.min(99.9, currentAccuracy + 0.1);
            accuracyStat.textContent = newAccuracy.toFixed(1) + '%';
            
            const shrinkageStat = document.querySelector('.dashboard .card:nth-child(4) .stat');
            const currentShrinkage = parseFloat(shrinkageStat.textContent);
            const newShrinkage = Math.max(0.1, currentShrinkage - 0.1);
            shrinkageStat.textContent = newShrinkage.toFixed(1) + '%';
            
            // Update the low stock alert
            const lowStockItems = document.querySelectorAll('.low-stock').length;
            document.querySelector('.dashboard .card:nth-child(3) .stat').textContent = lowStockItems;
            
            // Update alert message
            const alertMsg = document.querySelector('.alert.warning');
            if (lowStockItems > 0) {
                alertMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <strong>Attention:</strong> ${lowStockItems} item${lowStockItems > 1 ? 's are' : ' is'} running low on stock. Please reorder soon.`;
            } else {
                alertMsg.innerHTML = `<i class="fas fa-check-circle"></i> <strong>Good news:</strong> All items are sufficiently stocked.`;
                alertMsg.className = 'alert success';
            }
        }
        
        // Modal functions
        function showModal(content) {
            // Remove existing modal if present
            const existingModal = document.querySelector('.modal');
            if (existingModal) {
                document.body.removeChild(existingModal);
            }
            
            // Create modal overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal';
            modalOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            `;
            
            modalContent.innerHTML = content;
            
            // Close modal when clicking outside
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });
            
            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);
            
            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        }
        
        function closeModal() {
            const modal = document.querySelector('.modal');
            if (modal) {
                document.body.removeChild(modal);
            }
            document.body.style.overflow = '';
        }
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            // Add keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                // Spacebar for quick scan simulation
                if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    const barcodes = ['BMG-7821', 'BMG-4390', 'BMG-5567', 'BMG-9123', 'BMG-3345'];
                    const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
                    simulateScan(randomBarcode);
                }
                
                // Ctrl+S to save draft
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    saveDraft();
                }
                
                // Ctrl+P to print
                if (e.ctrlKey && e.key === 'p') {
                    e.preventDefault();
                    printCountSheet();
                }
            });
            
            // Show welcome message
            setTimeout(() => {
                showModal(`
                    <h3><i class="fas fa-info-circle" style="color: var(--primary-color);"></i> Welcome to BMG 178 Stock Management</h3>
                    <p>This system helps you:</p>
                    <ul style="margin: 15px 0 15px 20px;">
                        <li>Perform quick stock counts with barcode scanning</li>
                        <li>Track inventory levels in real-time</li>
                        <li>Generate reports on stock performance</li>
                        <li>Implement loss prevention strategies</li>
                    </ul>
                    <p><strong>Quick Tip:</strong> Press Spacebar to simulate a barcode scan.</p>
                    <div style="margin-top: 20px;">
                        <button class="btn" onclick="closeModal()">Get Started</button>
                    </div>
                `);
            }, 1000);
            
            // Update dashboard every 30 seconds (simulated)
            setInterval(updateDashboardStats, 30000);
        });
        
        // Simulate live updates to the dashboard
        setInterval(() => {
            // Randomly update some counts to simulate real-time changes
            const rows = document.querySelectorAll('#count-table tr');
            if (rows.length > 0 && Math.random() > 0.7) {
                const randomRow = rows[Math.floor(Math.random() * rows.length)];
                const countInput = randomRow.querySelector('td:nth-child(4) input');
                if (countInput) {
                    const change = Math.random() > 0.5 ? 1 : -1;
                    const current = parseInt(countInput.value, 10) || 0;
                    countInput.value = Math.max(0, current + change);
                    
                    // Update variance
                    const expectedCell = randomRow.querySelector('td:nth-child(3)');
                    const varianceCell = randomRow.querySelector('td:nth-child(5)');
                    const expected = parseInt(expectedCell.textContent, 10) || 0;
                    const newVariance = (parseInt(countInput.value, 10) || 0) - expected;
                    varianceCell.textContent = newVariance;
                    varianceCell.className = newVariance === 0 ? '' : newVariance < 0 ? 'low-stock' : '';
                    
                    // Update status
                    const statusCell = randomRow.querySelector('td:nth-child(6)');
                    statusCell.innerHTML = '';
                    let badgeClass = 'success';
                    let badgeText = 'Match';
                    
                    if (newVariance === 0) {
                        badgeClass = 'success';
                        badgeText = 'Match';
                    } else if (Math.abs(newVariance) <= 5) {
                        badgeClass = 'warning';
                        badgeText = 'Minor Diff';
                    } else {
                        badgeClass = 'danger';
                        badgeText = 'Major Diff';
                    }
                    
                    const badge = document.createElement('span');
                    badge.className = `badge ${badgeClass}`;
                    badge.textContent = badgeText;
                    statusCell.appendChild(badge);
                }
            }
        }, 10000); // Update every 10 seconds