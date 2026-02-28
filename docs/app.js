// Fetch and display data from data.json
async function fetchData() {
    const refreshIcon = document.getElementById('refresh-icon');
    if (refreshIcon) refreshIcon.classList.add('fa-spin');

    try {
        // We append a timestamp to bust the browser cache
        const response = await fetch('data.json?t=' + new Date().getTime());

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateDashboard(data);
    } catch (error) {
        console.error("Could not fetch data:", error);

        // If data.json doesn't exist yet (first run) or fails to load
        const tbody = document.getElementById('history-tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-info-circle text-gray-400 mb-2 text-xl"></i>
                        <p>No automation logs found yet. The first post will generate data.</p>
                    </td>
                </tr>
            `;
        }
    } finally {
        if (refreshIcon) refreshIcon.classList.remove('fa-spin');
    }
}

function updateDashboard(history) {
    if (!history || !Array.isArray(history) || history.length === 0) return;

    // Update Stats
    const totalPosts = history.length;
    const successfulPosts = history.filter(item => item.success).length;
    const failedPosts = totalPosts - successfulPosts;

    document.getElementById('stat-total').textContent = totalPosts;
    document.getElementById('stat-success').textContent = successfulPosts;
    document.getElementById('stat-failed').textContent = failedPosts;

    // Last Update
    const lastRun = new Date(history[0].timestamp);
    document.getElementById('last-run-time').textContent = lastRun.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) + ' EAT';

    // System Status
    const statusIndicator = document.getElementById('system-status-indicator');
    if (history[0].success) {
        statusIndicator.innerHTML = `
            <span class="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span class="text-green-600 font-semibold tracking-wide">System Healthy</span>
        `;
    } else {
        statusIndicator.innerHTML = `
            <span class="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></span>
            <span class="text-red-600 font-semibold tracking-wide">Failing</span>
        `;
    }

    // Populate Table
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = '';

    history.forEach(log => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50/50 transition-colors";

        // Status Badge
        const statusHtml = log.success
            ? `<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"><i class="fas fa-check mr-1.5"></i> Success</span>`
            : `<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800"><i class="fas fa-times mr-1.5"></i> Failed</span>`;

        // Timestamp
        const date = new Date(log.timestamp);
        const dateStr = date.toLocaleString('en-KE', {
            timeZone: 'Africa/Nairobi',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Error message or Action
        let actionHtml = '';
        if (log.success && log.postId) {
            actionHtml = `<a href="https://facebook.com/${log.postId}" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors inline-flex items-center">View Post <i class="fas fa-external-link-alt ml-1"></i></a>`;
        } else if (!log.success) {
            actionHtml = `<span class="text-xs text-red-600 font-mono truncate max-w-[200px] block" title="${log.error}">${log.error}</span>`;
        }

        const nicheBadge = log.niche ? `<span class="inline-block mt-1 text-[10px] uppercase tracking-wider text-gray-400 font-semibold border border-gray-200 px-1.5 rounded">${log.niche}</span>` : '';

        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${statusHtml}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-600 text-sm font-medium">${dateStr}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">#${log.postNumber || '-'}</td>
            <td class="px-6 py-4">
                <div class="text-gray-900 font-medium capitalize text-sm">${(log.contentType || 'N/A').replace('_', ' ')}</div>
                ${nicheBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                ${actionHtml}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Initial fetch
document.addEventListener('DOMContentLoaded', fetchData);
