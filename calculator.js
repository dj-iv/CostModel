document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    const coverageData = {
        go: {
            high_band: { sqm: { solid: 56, hollow: 94, cubical: 157, open: 250 }, sqft: { solid: 603, hollow: 1012, cubical: 1690, open: 2691 } },
            low_band: { sqm: { solid: 65, hollow: 148, cubical: 314, open: 590 }, sqft: { solid: 700, hollow: 1593, cubical: 3380, open: 6351 } }
        },
        quatra: {
            high_band: { sqm: { solid: 185, hollow: 319, cubical: 763, open: 1272, open_high_ceiling: 3000 }, sqft: { solid: 1991, hollow: 3434, cubical: 8213, open: 13692, open_high_ceiling: 32292 } },
            low_band: { sqm: { solid: 279, hollow: 464, cubical: 1160, open: 2000, open_high_ceiling: 3000 }, sqft: { solid: 3003, hollow: 4994, cubical: 12486, open: 21528, open_high_ceiling: 32292 } }
        }
    };

    const defaultPriceData = {
        'G41':{label:"CEL-FI GO G41",cost:800.19,margin:0.25},'G43':{label:"CEL-FI GO G43",cost:3149.37,margin:0.25},'QUATRA_NU':{label:"QUATRA 4000e NU",cost:5668.74,margin:0.25},'QUATRA_CU':{label:"QUATRA 4000e CU",cost:3400.74,margin:0.25},'QUATRA_HUB':{label:"QUATRA 4000e HUB",cost:4219.74,margin:0.25},'QUATRA_EVO_NU':{label:"QUATRA EVO NU",cost:2707.74,margin:0.25},'QUATRA_EVO_CU':{label:"QUATRA EVO CU",cost:1731.39,margin:0.25},'QUATRA_EVO_HUB':{label:"QUATRA EVO HUB",cost:2243.8,margin:0.25},'extender_cat6':{label:"Q4000 CAT6 Range Extender",cost:426.43,margin:0.25},'extender_fibre_cu':{label:"Q4000 Fibre Extender CU",cost:755.99,margin:0.25},'extender_fibre_nu':{label:"Q4000 Fibre Extender NU",cost:986.61,margin:0.25},'service_antennas':{label:"Omni Ceiling Antenna",cost:11.22,margin:7},'donor_wideband':{label:"Log-periodic Antenna",cost:20.08,margin:5},'donor_lpda':{label:"LPDA-R Antenna",cost:268.8,margin:0.62},'antenna_bracket':{label:"Antenna Bracket",cost:40,margin:0.5},
        'hybrids_4x4':{label:"4x4 Hybrid Combiner",cost:183.05,margin:1.0},
        'hybrids_2x2':{label:"2x2 Hybrid Combiner",cost:30.12,margin:3.0},
        'splitters_4way':{label:"4-Way Splitter",cost:18.36,margin:3},'splitters_3way':{label:"3-Way Splitter",cost:15.36,margin:3},'splitters_2way':{label:"2-Way Splitter",cost:14.18,margin:3},'pigtails':{label:"N-Male to SMA-Male Pigtail",cost:5.02,margin:5},'coax_lmr400':{label:"LMR400/HDF400 Coax Cable",cost:1.25,margin:3},'coax_half':{label:"1/2in Coax Cable",cost:1.78,margin:3},
        'cable_cat':{label:"CAT6 Cable",cost:0.7,margin:0.5},
        'cable_fibre':{label:"Fibre Cable/Patch",cost:100,margin:0.3},'connectors':{label:"N-Type Connectors",cost:1.42,margin:3},'connectors_rg45':{label:"RJ45 Connectors",cost:0.4,margin:2.5},'adapters_sfp':{label:"SFP Adapter",cost:25,margin:3},
        'adapters_n':{label:"4.3/10 to N Adapter",cost:4.61,margin:5.0},
        'install_internal':{label:"Installation (Internal)",cost:150,margin:3},'install_external':{label:"Installation (External)",cost:600,margin:0.5},'cherry_picker':{label:"Cherry Picker",cost:480,margin:0.3},'travel_expenses':{label:"Travel Expenses",cost:150,margin:0},
        'support_package': {label: "Annual Support Package", cost: 0, margin: 0}
    };
    
    const supportData = {
        'remote_monitoring': { label: 'Remote Monitoring', description: 'Alerts and events captured on the management portal', dpm: 0.005, tiers: ['silver', 'gold'], type: 'per_system' },
        'reactive_support': { label: 'Reactive Support', description: 'Customer identifies issue and reports to UCtel', dpm: 0.005, tiers: ['bronze', 'silver', 'gold'], type: 'per_system' },
        'proactive_alerting': { label: 'Proactive Alerting', description: 'Events and alerts received from management portal proactively investigated', dpm: 0.005, tiers: ['silver', 'gold'], type: 'per_system' },
        'incident_management': { label: 'Incident Management', description: 'Incident managed via email by UCtel', dpm: 0.01, tiers: ['bronze', 'silver', 'gold'], type: 'per_system' },
        'change_management': { label: 'Change Management', description: 'Remote changes (e.g., change in network operator)', dpm: 0.005, tiers: ['silver', 'gold'], type: 'per_system' },
        'onsite_support': { label: 'On-site support', description: 'Engineer to site for system diagnostic or antenna repositioning', dpm: 0.05, tiers: ['gold'], type: 'fixed_annual' },
        'service_reports': { label: 'Service Reports', description: 'On-Site Annual System Check Up (50k+ Installs)', dpm: 0, tiers: [], type: 'fixed_annual' },
        'service_review': { label: 'Service Review Meetings', description: 'Spare', dpm: 0, tiers: [], type: 'fixed_annual' },
        'maintenance_parts': { label: 'Maintenance (Parts only)', description: 'Break/Fix maintenance - parts to site', dpm: 0.0025, tiers: ['bronze', 'silver'], type: 'fixed_annual' },
        'maintenance_engineer': { label: 'Maintenance (with engineer)', description: 'Break / fix maintenance with engineer to site', dpm: 0.1, tiers: ['gold'], type: 'fixed_annual' }
    };

    let priceData = {};
    let currentResults = {};
    let showZeroQuantityItems = false;

    // --- PRICE & SUPPORT MANAGEMENT ---
    function loadPrices() { try { const savedPrices = localStorage.getItem('universalCalculatorPrices'); if (savedPrices) { priceData = JSON.parse(savedPrices); for(const key in defaultPriceData) if(!priceData[key]) priceData[key] = defaultPriceData[key]; } else { priceData = JSON.parse(JSON.stringify(defaultPriceData)); } } catch (e) { console.error("Could not load prices", e); priceData = JSON.parse(JSON.stringify(defaultPriceData)); } }
    function savePrices(newPriceData) { try { localStorage.setItem('universalCalculatorPrices', JSON.stringify(newPriceData)); priceData = newPriceData; runFullCalculation(); alert('Prices saved successfully!'); } catch (e) { console.error("Could not save prices.", e); alert('Error: Could not save prices.'); } }
    function setupSettingsModal() { const modal = document.getElementById('settings-modal'), btn = document.getElementById('settings-btn'), closeBtn = modal.querySelector('.close-btn'), cancelBtn = document.getElementById('modal-cancel'), saveBtn = document.getElementById('modal-save'); btn.onclick = () => { populateSettingsModal(); modal.style.display = "block"; }; const closeModal = () => modal.style.display = "none"; closeBtn.onclick = closeModal; cancelBtn.onclick = closeModal; window.onclick = (event) => { if (event.target == modal) closeModal(); }; saveBtn.onclick = () => { const newPriceData = JSON.parse(JSON.stringify(priceData)); let allValid = true; for(const key in newPriceData) { const newCost = parseFloat(document.getElementById(`cost-${key}`).value), newMargin = parseFloat(document.getElementById(`margin-${key}`).value) / 100; if (!isNaN(newCost) && !isNaN(newMargin)) { newPriceData[key].cost = newCost; newPriceData[key].margin = newMargin; } else { allValid = false; } } if(allValid) { savePrices(newPriceData); closeModal(); } else { alert("Please ensure all values are valid numbers."); } }; }
  function populateSettingsModal() {
    const container = document.getElementById('settings-form-container');
    let html = `<div class="setting-item setting-header"><span>Component</span><span>Cost (£)</span><span>Margin (%)</span><span>Sell (£)</span></div>`;
    const sortedKeys = Object.keys(priceData).sort((a, b) => priceData[a].label.localeCompare(priceData[b].label));
    for(const key of sortedKeys) {
        const item = priceData[key];
        const sellPrice = item.cost * (1 + item.margin);
        // REMOVED oninput="..." from the next line
        html += `<div class="setting-item"><label for="cost-${key}">${item.label}</label><input type="number" step="0.01" id="cost-${key}" value="${item.cost.toFixed(2)}"><input type="number" step="0.01" id="margin-${key}" value="${(item.margin * 100).toFixed(2)}"><span id="sell-${key}" class="sell-price-display">£${sellPrice.toFixed(2)}</span></div>`;
    }
    container.innerHTML = html;

    // Attach event listeners programmatically
    for(const key of sortedKeys) {
        const costInput = document.getElementById(`cost-${key}`);
        const marginInput = document.getElementById(`margin-${key}`);
        const handler = () => updateSellPriceDisplay(key);
        if(costInput) costInput.addEventListener('input', handler);
        if(marginInput) marginInput.addEventListener('input', handler);
    }
}
    function populateSupportTable() {
        const table = document.getElementById('support-table');
        if (!table) return;
        let html = `<thead><tr><th>Included Services</th><th>Description</th><th>Bronze</th><th>Silver</th><th>Gold</th><th>dpm/sys</th><th>dpy/sys</th></tr></thead><tbody>`;
        for (const key in supportData) {
            const item = supportData[key];
            const dpy = item.dpm * 12;
            html += `<tr><td>${item.label}</td><td>${item.description}</td>
                <td><input type="checkbox" class="support-checkbox" data-key="${key}" data-tier="bronze"></td>
                <td><input type="checkbox" class="support-checkbox" data-key="${key}" data-tier="silver"></td>
                <td><input type="checkbox" class="support-checkbox" data-key="${key}" data-tier="gold"></td>
                <td><input type="number" class="dpm-input" data-key="${key}" value="${item.dpm.toFixed(4)}" step="0.0001"></td>
                <td><span id="dpy-${key}">${dpy.toFixed(4)}</span></td></tr>`;
        }
        html += `</tbody><tfoot>
            <tr class="summary-row"><td colspan="2" style="text-align:right;">Summary per system per year (£)</td><td id="bronze-sys-summary">£0.00</td><td id="silver-sys-summary">£0.00</td><td id="gold-sys-summary">£0.00</td><td colspan="2"></td></tr>
            <tr class="summary-row"><td colspan="2" style="text-align:right;">Summary per year (£)</td><td id="bronze-year-summary">£0.00</td><td id="silver-year-summary">£0.00</td><td id="gold-year-summary">£0.00</td><td colspan="2"></td></tr>
        </tfoot>`;
        table.innerHTML = html;

        document.querySelectorAll('.support-checkbox').forEach(box => box.addEventListener('change', () => {
            document.querySelectorAll('.support-presets button').forEach(b => b.classList.remove('active-preset'));
            runFullCalculation();
        }));
        document.querySelectorAll('.dpm-input').forEach(el => {
            el.addEventListener('input', (e) => {
                const key = e.target.dataset.key;
                const dpySpan = document.getElementById(`dpy-${key}`);
                const dpmValue = parseFloat(e.target.value) || 0;
                if (dpySpan) dpySpan.textContent = (dpmValue * 12).toFixed(4);
            });
            el.addEventListener('change', runFullCalculation);
        });

        document.getElementById('support-preset-none').addEventListener('click', () => setSupportPreset('none'));
        document.getElementById('support-preset-bronze').addEventListener('click', () => setSupportPreset('bronze'));
        document.getElementById('support-preset-silver').addEventListener('click', () => setSupportPreset('silver'));
        document.getElementById('support-preset-gold').addEventListener('click', () => setSupportPreset('gold'));
    }
    function setSupportPreset(tier) {
        document.querySelectorAll('.support-presets button').forEach(b => b.classList.remove('active-preset'));
        const presetBtn = document.getElementById(`support-preset-${tier}`);
        if(presetBtn) presetBtn.classList.add('active-preset');
        
        document.querySelectorAll('.support-checkbox').forEach(box => {
            const key = box.dataset.key;
            const boxTier = box.dataset.tier;
            box.checked = supportData[key].tiers.includes(tier) && boxTier === tier;
        });

        if (tier === 'none') {
            document.getElementById('maintenance-percent').value = 0;
        } else {
            document.getElementById('maintenance-percent').value = 5;
        }
        runFullCalculation();
    }
    function updateSupportTableSummaries(totalHardwareUnits) {
        const dailyInstallRate = priceData.install_internal.cost * (1 + priceData.install_internal.margin);
        const tierPerSystemDPY = { bronze: 0, silver: 0, gold: 0 };
        const tierFixedAnnualDPY = { bronze: 0, silver: 0, gold: 0 };
        
        for (const tier of ['bronze', 'silver', 'gold']) {
            document.querySelectorAll(`.support-checkbox[data-tier="${tier}"]:checked`).forEach(box => {
                const key = box.dataset.key;
                const dpmInput = document.querySelector(`.dpm-input[data-key="${key}"]`);
                if (dpmInput) {
                    const dpyValue = (parseFloat(dpmInput.value) || 0) * 12;
                    if (supportData[key].type === 'per_system') {
                        tierPerSystemDPY[tier] += dpyValue;
                    } else {
                        tierFixedAnnualDPY[tier] += dpyValue;
                    }
                }
            });
        }

        for (const tier of ['bronze', 'silver', 'gold']) {
            const sysSummaryCell = document.getElementById(`${tier}-sys-summary`);
            const yearSummaryCell = document.getElementById(`${tier}-year-summary`);
            
            // Per-system summary should NOT be multiplied by totalHardwareUnits
            if(sysSummaryCell) sysSummaryCell.textContent = `£${(tierPerSystemDPY[tier] * dailyInstallRate).toFixed(2)}`;
            
            // Per-year summary for fixed services should be
            const fixedServicesCost = tierFixedAnnualDPY[tier] * dailyInstallRate;
            if(yearSummaryCell) yearSummaryCell.textContent = `£${fixedServicesCost.toFixed(2)}`;
        }
    }
    function calculateSupportCost(totalHardwareUnits, totalHardwareSellPrice) {
        let totalPerSystemDPY = 0, totalFixedAnnualDPY = 0;
        const selectedServices = document.querySelectorAll('.support-checkbox:checked');
        const maintenancePercent = parseFloat(document.getElementById('maintenance-percent').value) || 0;
        if (selectedServices.length === 0 && maintenancePercent === 0) return 0;
        
        selectedServices.forEach(box => {
            const key = box.dataset.key;
            const dpmInput = document.querySelector(`.dpm-input[data-key="${key}"]`);
            if (dpmInput) {
                const dpyValue = (parseFloat(dpmInput.value) || 0) * 12;
                if (supportData[key].type === 'per_system') totalPerSystemDPY += dpyValue;
                else totalFixedAnnualDPY += dpyValue;
            }
        });
        
        const dailyInstallRate = priceData.install_internal.cost * (1 + priceData.install_internal.margin);
        const perSystemCost = totalPerSystemDPY * dailyInstallRate * totalHardwareUnits;
        const fixedAnnualCost = totalFixedAnnualDPY * dailyInstallRate;
        const maintenanceCost = totalHardwareSellPrice * (maintenancePercent / 100);
        return perSystemCost + fixedAnnualCost + maintenanceCost;
    }

    // --- HELPER & OVERRIDE FUNCTIONS ---
    function getSplitterCascade(k) { if (k <= 1) return { d4: 0, d3: 0, d2: 0 }; const d4_dist = (k === 6) ? 0 : ((k % 4 === 1) ? Math.max(0, Math.floor(k / 4) - 1) : Math.floor(k / 4)); const d3_dist = Math.floor((k - 4 * d4_dist) / 3); const d2_dist = Math.ceil((k - 4 * d4_dist - 3 * d3_dist) / 2); const num_dist = d4_dist + d3_dist + d2_dist; return { d4: d4_dist + ((num_dist === 4) ? 1 : 0), d3: d3_dist + ((num_dist === 3) ? 1 : 0), d2: d2_dist + ((num_dist === 2) ? 1 : 0) }; }
    function activateEditMode(cell, key) { const displaySpan = cell.querySelector('.value-display'), inputField = cell.querySelector('.value-input'); displaySpan.classList.add('hidden'); inputField.classList.remove('hidden'); const currentValue = currentResults[key].override !== null ? currentResults[key].override : currentResults[key].calculated; inputField.value = currentValue; inputField.focus(); inputField.select(); }
    function deactivateEditMode(cell, key, save) { const displaySpan = cell.querySelector('.value-display'), inputField = cell.querySelector('.value-input'); if (save) { const newValue = parseFloat(inputField.value); if (!isNaN(newValue)) { currentResults[key].override = newValue; runFullCalculation(); } } else { inputField.classList.add('hidden'); displaySpan.classList.remove('hidden'); } }
    function updateCellDisplay(cell, key) { const item = currentResults[key], displaySpan = cell.querySelector('.value-display'), isOverridden = item.override !== null, value = isOverridden ? item.override : item.calculated; displaySpan.textContent = `${value.toFixed(item.decimals || 0)}`; displaySpan.classList.toggle('overridden', isOverridden); }
    
    // --- MODULAR SYSTEM CALCULATORS ---
    function getBaseCalculations(params, systemType) { const { B_SA, D_DA } = params; let service_coax = (B_SA * 30); if (systemType === 'QUATRA' || systemType === 'QUATRA_EVO') { service_coax = 0; } const coax_total = service_coax + (D_DA * 50); return { donor_lpda: 0, donor_wideband: D_DA, antenna_bracket: D_DA, coax_half: 0, coax_lmr400: coax_total, cherry_picker: 0, install_external: 0, travel_expenses: 0, }; }
    const systemCalculators = {
        'G41': params => { const { B_SA, C_Net, D_DA, E_Max } = params; let r = getBaseCalculations(params, 'G41'); const num_systems = (B_SA === 0 || E_Max === 0) ? 0 : Math.ceil(B_SA / E_Max); r.G41 = num_systems * C_Net; const G_DonorPorts = C_Net * num_systems; const SA_per_set = (num_systems === 0) ? 0 : Math.ceil(B_SA / num_systems); const is_4x4 = (C_Net === 4 && SA_per_set >= 3), is_2x2 = (C_Net === 2 && SA_per_set >= 2); let s4=0,s3=0,s2=0; if (is_4x4 || is_2x2) { const num_outputs=is_4x4?4:2,antennas_per_output=Math.ceil(SA_per_set/num_outputs),splitters=getSplitterCascade(antennas_per_output); s4=splitters.d4*num_outputs;s3=splitters.d3*num_outputs;s2=splitters.d2*num_outputs;} else { const d4=(SA_per_set<=1)?0:((SA_per_set===6)?0:((SA_per_set%4===1)?Math.max(0,Math.floor(SA_per_set/4)-1):Math.floor(SA_per_set/4))),d3=(SA_per_set<=1)?0:Math.floor((SA_per_set-4*d4)/3),d2=(SA_per_set<=1)?0:Math.ceil((SA_per_set-4*d4-3*d3)/2),nd=d4+d3+d2; s4=d4+((C_Net===4)?1:0)+((nd===4)?1:0);s3=d3+((C_Net===3)?1:0)+((nd===3)?1:0);s2=d2+((C_Net===2)?1:0)+((nd===2)?1:0);} let d4_way=0,d3_way=0,d2_way=0; if(G_DonorPorts>D_DA&&D_DA>0){ const p_ceil=Math.ceil(G_DonorPorts/D_DA),p_floor=Math.floor(G_DonorPorts/D_DA),n_ceil=(G_DonorPorts%D_DA===0)?0:(G_DonorPorts%D_DA),n_floor=D_DA-n_ceil; const s_ceil=getSplitterCascade(p_ceil),s_floor=getSplitterCascade(p_floor); d4_way=n_ceil*s_ceil.d4+n_floor*s_floor.d4;d3_way=n_ceil*s_ceil.d3+n_floor*s_floor.d3;d2_way=n_ceil*s_ceil.d2+n_floor*s_floor.d2;} r.hybrids_4x4=is_4x4?num_systems:0;r.hybrids_2x2=is_2x2?num_systems:0; r.splitters_4way=(s4*num_systems)+d4_way;r.splitters_3way=(s3*num_systems)+d3_way;r.splitters_2way=(s2*num_systems)+d2_way; r.pigtails=r.G41+G_DonorPorts; r.connectors=(B_SA+D_DA)+(r.splitters_4way*5+r.splitters_3way*4+r.splitters_2way*3)+(r.hybrids_4x4*8+r.hybrids_2x2*4); r.install_internal=Math.ceil((B_SA/3)+(D_DA/3)+(r.G41/4)+1); return r; },
        'G43': params => { const { B_SA, C_Net, D_DA, E_Max } = params; let r = getBaseCalculations(params, 'G43'); const is_4_nets=(C_Net===4),outputs_per_set=is_4_nets?6:3,max_antennas_per_set=outputs_per_set*E_Max; const num_sets=(B_SA>0&&max_antennas_per_set>0)?Math.ceil(B_SA/max_antennas_per_set):0; r.G43=is_4_nets?(num_sets*2):num_sets;r.hybrids_2x2=is_4_nets?(num_sets*3):0;r.hybrids_4x4=0; const G_DonorPorts=is_4_nets?(num_sets*6):(num_sets*3); let s4_t=0,s3_t=0,s2_t=0; if(B_SA>0&&E_Max>0){const total_outputs=num_sets*outputs_per_set,antennas_per_output=total_outputs>0?Math.ceil(B_SA/total_outputs):0; const splitters=getSplitterCascade(antennas_per_output); s4_t=splitters.d4*total_outputs;s3_t=splitters.d3*total_outputs;s2_t=splitters.d2*total_outputs;} let d4_t=0,d3_t=0,d2_t=0; if(G_DonorPorts>D_DA&&D_DA>0){const p_ceil=Math.ceil(G_DonorPorts/D_DA),p_floor=Math.floor(G_DonorPorts/D_DA),n_ceil=(G_DonorPorts%D_DA===0)?0:(G_DonorPorts%D_DA),n_floor=D_DA-n_ceil; const s_ceil=getSplitterCascade(p_ceil),s_floor=getSplitterCascade(p_floor); d4_t=n_ceil*s_ceil.d4+n_floor*s_floor.d4;d3_t=n_ceil*s_ceil.d3+n_floor*s_floor.d3;d2_t=n_ceil*s_ceil.d2+n_floor*s_floor.d2;} r.splitters_4way=s4_t+d4_t;r.splitters_3way=s3_t+d3_t;r.splitters_2way=s2_t+d2_t; r.pigtails=is_4_nets?(num_sets*6):0; r.connectors=(B_SA+D_DA)+(r.splitters_4way*5+r.splitters_3way*4+r.splitters_2way*3)+(r.hybrids_4x4*8+r.hybrids_2x2*4); r.install_internal=Math.ceil((B_SA/3)+(D_DA/3)+(r.G43/4)+1); return r; },
        'QUATRA': params => { const { B_SA, C_Net, D_DA } = params; let r=getBaseCalculations(params, 'QUATRA'); r.QUATRA_CU=B_SA; const num_full=Math.floor(r.QUATRA_CU/12),rem_cus=r.QUATRA_CU%12; r.QUATRA_NU=num_full+(rem_cus>0?1:0);r.QUATRA_HUB=num_full+(rem_cus>6?1:0); const G_DonorPorts=4*r.QUATRA_NU;let d4=0,d3=0,d2=0; if(G_DonorPorts>D_DA&&D_DA>0){const p_c=Math.ceil(G_DonorPorts/D_DA),p_f=Math.floor(G_DonorPorts/D_DA),n_c=(G_DonorPorts%D_DA===0)?0:(G_DonorPorts%D_DA),n_f=D_DA-n_c; const s_c=getSplitterCascade(p_c),s_f=getSplitterCascade(p_f); d4=n_c*s_c.d4+n_f*s_f.d4;d3=n_c*s_c.d3+n_f*s_f.d3;d2=n_c*s_c.d2+n_f*s_f.d2;} r.splitters_4way=d4;r.splitters_3way=d3;r.splitters_2way=d2; r.adapters_n=r.QUATRA_CU+r.QUATRA_NU*C_Net;r.connectors_rg45=r.QUATRA_CU*4; r.cable_fibre=r.QUATRA_HUB;r.adapters_sfp=r.QUATRA_HUB*2;r.cable_cat=r.QUATRA_CU*200; r.connectors=D_DA+(r.splitters_4way*5+r.splitters_3way*4+r.splitters_2way*3)+G_DonorPorts; r.install_internal=Math.ceil((r.QUATRA_CU/2)+(D_DA/2)+(r.QUATRA_NU/7)+1); r.extender_cat6=0;r.extender_fibre_cu=0;r.extender_fibre_nu=0; return r;},
        'QUATRA_DAS': params => { const { B_SA, C_Net, D_DA, E_Max } = params; let r=getBaseCalculations(params, 'QUATRA_DAS'); r.QUATRA_CU=(B_SA===0||E_Max===0)?0:Math.ceil(B_SA/E_Max); const SA_per_set=(r.QUATRA_CU===0)?0:Math.ceil(B_SA/r.QUATRA_CU); const s_per_cu=getSplitterCascade(SA_per_set); const s_4W=s_per_cu.d4*r.QUATRA_CU,s_3W=s_per_cu.d3*r.QUATRA_CU,s_2W=s_per_cu.d2*r.QUATRA_CU; const num_full=Math.floor(r.QUATRA_CU/12),rem_cus=r.QUATRA_CU%12; r.QUATRA_NU=num_full+(rem_cus>0?1:0);r.QUATRA_HUB=num_full+(rem_cus>6?1:0); const G_DonorPorts=4*r.QUATRA_NU;let d4=0,d3=0,d2=0; if(G_DonorPorts>D_DA&&D_DA>0){const p_c=Math.ceil(G_DonorPorts/D_DA),p_f=Math.floor(G_DonorPorts/D_DA),n_c=(G_DonorPorts%D_DA===0)?0:(G_DonorPorts%D_DA),n_f=D_DA-n_c; const s_c=getSplitterCascade(p_c),s_f=getSplitterCascade(p_f); d4=n_c*s_c.d4+n_f*s_f.d4;d3=n_c*s_c.d3+n_f*s_f.d3;d2=n_c*s_c.d2+n_f*s_f.d2;} r.splitters_4way=s_4W+d4;r.splitters_3way=s_3W+d3;r.splitters_2way=s_2W+d2; r.adapters_n=r.QUATRA_CU+r.QUATRA_NU*C_Net;r.connectors_rg45=r.QUATRA_CU*4; r.cable_fibre=r.QUATRA_HUB;r.adapters_sfp=r.QUATRA_HUB*2;r.cable_cat=r.QUATRA_CU*200; r.connectors=(B_SA+D_DA)+(r.splitters_4way*5+r.splitters_3way*4+r.splitters_2way*3)+G_DonorPorts; r.install_internal=Math.ceil((B_SA/3)+(r.QUATRA_CU/2)+(D_DA/2)+(r.QUATRA_NU/7)+1); r.extender_cat6=0;r.extender_fibre_cu=0;r.extender_fibre_nu=0; return r;},
        'QUATRA_EVO': params => { const { B_SA, C_Net, D_DA } = params; let r=getBaseCalculations(params, 'QUATRA_EVO'); r.QUATRA_EVO_CU=B_SA; const num_full=Math.floor(r.QUATRA_EVO_CU/12),rem_cus=r.QUATRA_EVO_CU%12; r.QUATRA_EVO_NU=num_full+(rem_cus>0?1:0);r.QUATRA_EVO_HUB=num_full+(rem_cus>6?1:0); const G_DonorPorts=2*r.QUATRA_EVO_NU;let d4=0,d3=0,d2=0; if(G_DonorPorts>D_DA&&D_DA>0){const p_c=Math.ceil(G_DonorPorts/D_DA),p_f=Math.floor(G_DonorPorts/D_DA),n_c=(G_DonorPorts%D_DA===0)?0:(G_DonorPorts%D_DA),n_f=D_DA-n_c; const s_c=getSplitterCascade(p_c),s_f=getSplitterCascade(p_f); d4=n_c*s_c.d4+n_f*s_f.d4;d3=n_c*s_c.d3+n_f*s_f.d3;d2=n_c*s_c.d2+n_f*s_f.d2;} r.splitters_4way=d4;r.splitters_3way=d3;r.splitters_2way=d2; r.adapters_n=r.QUATRA_EVO_CU+r.QUATRA_EVO_NU*C_Net;r.connectors_rg45=r.QUATRA_EVO_CU*4; r.cable_fibre=r.QUATRA_EVO_HUB;r.adapters_sfp=r.QUATRA_EVO_HUB*2;r.cable_cat=r.QUATRA_EVO_CU*200; r.connectors=D_DA+(r.splitters_4way*5+r.splitters_3way*4+r.splitters_2way*3)+G_DonorPorts; r.install_internal=Math.ceil((r.QUATRA_EVO_CU/2)+(D_DA/2)+(r.QUATRA_EVO_NU/7)+1); r.extender_cat6=0;r.extender_fibre_cu=0;r.extender_fibre_nu=0; return r;},
        'QUATRA_EVO_DAS': params => { const { B_SA, C_Net, D_DA, E_Max } = params; let r=getBaseCalculations(params, 'QUATRA_EVO_DAS'); r.QUATRA_EVO_CU=(B_SA===0||E_Max===0)?0:Math.ceil(B_SA/E_Max); const SA_per_set=(r.QUATRA_EVO_CU===0)?0:Math.ceil(B_SA/r.QUATRA_EVO_CU); const s_per_cu=getSplitterCascade(SA_per_set); const s_4W=s_per_cu.d4*r.QUATRA_EVO_CU,s_3W=s_per_cu.d3*r.QUATRA_EVO_CU,s_2W=s_per_cu.d2*r.QUATRA_EVO_CU; const num_full=Math.floor(r.QUATRA_EVO_CU/12),rem_cus=r.QUATRA_EVO_CU%12; r.QUATRA_EVO_NU=num_full+(rem_cus>0?1:0);r.QUATRA_EVO_HUB=num_full+(rem_cus>6?1:0); const G_DonorPorts=2*r.QUATRA_EVO_NU;let d4=0,d3=0,d2=0; if(G_DonorPorts>D_DA&&D_DA>0){const p_c=Math.ceil(G_DonorPorts/D_DA),p_f=Math.floor(G_DonorPorts/D_DA),n_c=(G_DonorPorts%D_DA===0)?0:(G_DonorPorts%D_DA),n_f=D_DA-n_c; const s_c=getSplitterCascade(p_c),s_f=getSplitterCascade(p_f); d4=n_c*s_c.d4+n_f*s_f.d4;d3=n_c*s_c.d3+n_f*s_f.d3;d2=n_c*s_c.d2+n_f*s_f.d2;} r.splitters_4way=s_4W+d4;r.splitters_3way=s_3W+d3;r.splitters_2way=s_2W+d2; r.adapters_n=r.QUATRA_EVO_CU+r.QUATRA_EVO_NU*C_Net;r.connectors_rg45=r.QUATRA_EVO_CU*4; r.cable_fibre=r.QUATRA_EVO_HUB;r.adapters_sfp=r.QUATRA_EVO_HUB*2;r.cable_cat=r.QUATRA_EVO_CU*200; r.connectors=(B_SA+D_DA)+(r.splitters_4way*5+r.splitters_3way*4+r.splitters_2way*3)+G_DonorPorts; r.install_internal=Math.ceil((B_SA/3)+(r.QUATRA_EVO_CU/2)+(D_DA/2)+(r.QUATRA_EVO_NU/7)+1); r.extender_cat6=0;r.extender_fibre_cu=0;r.extender_fibre_nu=0; return r;}
    };
    
    // --- MAIN CALCULATION & DOM UPDATE ---
    
    function runFullCalculation() {
        try {
            // Stage 1: Calculate base hardware quantities
            const systemType = document.getElementById('system-type').value;
            const networksInput = document.getElementById('number-of-networks');
            if (systemType.includes('EVO') && parseInt(networksInput.value) > 2) { networksInput.value = '2'; }
            const params = { B_SA: parseInt(document.getElementById('total-service-antennas').value) || 0, C_Net: parseInt(networksInput.value) || 0, E_Max: parseInt(document.getElementById('max-antennas').value) || 0, };
            params.D_DA = params.C_Net;
            const calculatedValues = systemCalculators[systemType](params);
            for (const key in calculatedValues) { if (currentResults[key]) currentResults[key].calculated = calculatedValues[key]; else currentResults[key] = { calculated: calculatedValues[key], override: null, decimals: 0, unit: { coax_half: ' (m)', coax_lmr400: ' (m)', cable_cat: ' (m)', install_internal: ' (Days)', install_external: ' (Days)' }[key] || '' };}
            if(!currentResults['service_antennas']) currentResults['service_antennas'] = { calculated: 0, override: null, decimals: 0, unit: '' };
            currentResults['service_antennas'].calculated = params.B_SA;
            const internal_days = currentResults['install_internal']?.override ?? currentResults['install_internal']?.calculated ?? 0;
            if(currentResults['travel_expenses']) currentResults['travel_expenses'].calculated = internal_days;
            else currentResults['travel_expenses'] = { calculated: internal_days, override: null, decimals: 0, unit: ' (Days)'};

            // Stage 2: Calculate hardware totals for support cost calculation
            let totalHardwareSellPrice = 0, totalHardwareUnits = 0;
            const hardwareKeys = ['G41', 'G43', 'QUATRA_NU', 'QUATRA_CU', 'QUATRA_HUB', 'QUATRA_EVO_NU', 'QUATRA_EVO_CU', 'QUATRA_EVO_HUB', 'extender_cat6', 'extender_fibre_cu', 'extender_fibre_nu'];
            for (const key of hardwareKeys) {
                if (currentResults[key]) {
                    const quantity = currentResults[key].override ?? currentResults[key].calculated;
                    if (quantity > 0) {
                        totalHardwareUnits += quantity;
                        const priceInfo = priceData[key];
                        totalHardwareSellPrice += quantity * priceInfo.cost * (1 + priceInfo.margin);
                    }
                }
            }

            // Stage 3: Calculate support cost and determine its label
            const supportCost = calculateSupportCost(totalHardwareUnits, totalHardwareSellPrice);
            if(!currentResults['support_package']) currentResults['support_package'] = { calculated: 0, override: null, decimals: 2, unit: ''};
            currentResults['support_package'].calculated = supportCost;
            priceData['support_package'].cost = supportCost;
            
            if (supportCost > 0) {
                const activeButton = document.querySelector('.support-presets button.active-preset');
                if (activeButton && activeButton.id !== 'support-preset-none') {
                    const tier = activeButton.id.replace('support-preset-', ''); // e.g. 'gold'
                    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1); // e.g. 'Gold'
                    priceData['support_package'].label = `Annual ${tierName} Support Package`;
                } else {
                    priceData['support_package'].label = `Annual Custom Support Package`;
                }
            } else {
                priceData['support_package'].label = "Annual Support Package"; // Reset to default
            }
            
            updateDOM();
        } catch (error) {
            console.error("A critical error occurred during calculation:", error);
            const resultsBody = document.getElementById('results-tbody');
            if(resultsBody) resultsBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">An error occurred. Please refresh and try again.</td></tr>`;
        }
    }
    
    function updateDOM() {
        const systemType = document.getElementById('system-type').value;
        const excludeHardware = document.getElementById('no-hardware-checkbox').checked;
        const referralPercent = parseFloat(document.getElementById('referral-fee-percent').value) || 0;
        const referralDecimal = referralPercent / 100;
        const uplift = (referralDecimal > 0 && referralDecimal < 1) ? 1 / (1 - referralDecimal) : 1;
        document.getElementById('high-ceiling-checkbox-group').style.display = ['QUATRA', 'QUATRA_EVO'].includes(systemType) ? 'block' : 'none';
        document.getElementById('max-antennas-group').style.display = ['QUATRA', 'QUATRA_EVO', 'QUATRA_DAS', 'QUATRA_EVO_DAS'].includes(systemType) ? 'none' : 'flex';
        const resultsHead = document.getElementById('results-thead'), resultsBody = document.getElementById('results-tbody');
        resultsBody.innerHTML = '';
        resultsHead.innerHTML = `<tr><th class="col-item">Item</th><th class="col-qty">Qty</th><th class="col-sell">Unit Sell</th><th class="col-total">Total Sell</th><th class="col-margin">Margin (£)</th></tr>`;
        
        let totalHardwareUnits = 0;
        const hardwareKeys = ['G41', 'G43', 'QUATRA_NU', 'QUATRA_CU', 'QUATRA_HUB', 'QUATRA_EVO_NU', 'QUATRA_EVO_CU', 'QUATRA_EVO_HUB', 'extender_cat6', 'extender_fibre_cu', 'extender_fibre_nu'];
        for (const key of hardwareKeys) { if (currentResults[key]) { const quantity = currentResults[key].override ?? currentResults[key].calculated; if (quantity > 0) { totalHardwareUnits += quantity; } } }
        
        const itemGroups = {
            hardware: ['G41', 'G43', 'QUATRA_NU', 'QUATRA_CU', 'QUATRA_HUB', 'QUATRA_EVO_NU', 'QUATRA_EVO_CU', 'QUATRA_EVO_HUB', 'extender_cat6', 'extender_fibre_cu', 'extender_fibre_nu'],
            consumables: ['service_antennas', 'donor_wideband', 'donor_lpda', 'antenna_bracket', 'hybrids_4x4', 'hybrids_2x2', 'splitters_4way', 'splitters_3way', 'splitters_2way', 'pigtails', 'coax_lmr400', 'coax_half', 'cable_cat', 'cable_fibre', 'connectors', 'connectors_rg45', 'adapters_sfp', 'adapters_n'],
            services: ['install_internal', 'install_external', 'cherry_picker', 'travel_expenses', 'support_package']
        };
        const componentRelevance = {
            all: ['service_antennas', 'donor_wideband', 'donor_lpda', 'antenna_bracket', 'splitters_4way', 'splitters_3way', 'splitters_2way', 'coax_lmr400', 'coax_half', 'connectors', 'install_internal', 'install_external', 'cherry_picker', 'travel_expenses'],
            go: ['hybrids_4x4', 'hybrids_2x2', 'pigtails'],
            quatra: ['cable_cat', 'cable_fibre', 'connectors_rg45', 'adapters_sfp', 'adapters_n', 'extender_cat6', 'extender_fibre_cu', 'extender_fibre_nu'],
            G41: ['G41'], G43: ['G43'],
            QUATRA: ['QUATRA_NU', 'QUATRA_CU', 'QUATRA_HUB'], QUATRA_DAS: ['QUATRA_NU', 'QUATRA_CU', 'QUATRA_HUB'],
            QUATRA_EVO: ['QUATRA_EVO_NU', 'QUATRA_EVO_CU', 'QUATRA_EVO_HUB'], QUATRA_EVO_DAS: ['QUATRA_EVO_NU', 'QUATRA_EVO_CU', 'QUATRA_EVO_HUB'],
        };
        
        let subTotals = { hardware: { cost: 0, sell: 0, margin: 0 }, consumables: { cost: 0, sell: 0, margin: 0 }, services: { cost: 0, sell: 0, margin: 0 } };
        for (const groupName in itemGroups) {
            let groupHTML = '', groupSubTotalCost = 0, groupSubTotalSell = 0, groupSubTotalMargin = 0, itemsInGroupDisplayed = 0;
            itemGroups[groupName].forEach(key => {
                if (!currentResults[key]) currentResults[key] = { calculated: 0, override: null, decimals: 0, unit: '' };
                const itemResult = currentResults[key], priceInfo = priceData[key] || { cost: 0, margin: 0, label: 'N/A' };
                const quantity = itemResult.override !== null ? itemResult.override : (key === 'support_package' ? 1 : itemResult.calculated);
                let isRelevant = true;
                if (groupName === 'hardware' || groupName === 'consumables') { isRelevant = false; if (componentRelevance.all.includes(key)) isRelevant = true; if (componentRelevance[systemType]?.includes(key)) isRelevant = true; if (systemType.includes('G4') && componentRelevance.go.includes(key)) isRelevant = true; if (systemType.includes('QUATRA') && componentRelevance.quatra.includes(key)) isRelevant = true; }
                if (key === 'support_package' && (itemResult.calculated <= 0 && itemResult.override === null)) isRelevant = false;

                if (isRelevant && (quantity > 0 || showZeroQuantityItems)) {
                    const baseUnitSell = priceInfo.cost * (1 + priceInfo.margin);
                    const finalUnitSell = baseUnitSell * uplift;
                    const finalTotalSell = finalUnitSell * quantity;
                    let trueLineMargin = (baseUnitSell - priceInfo.cost) * quantity;
                    
                    if (key === 'support_package') {
                        trueLineMargin = finalTotalSell;
                        groupSubTotalSell += finalTotalSell;
                        groupSubTotalMargin += finalTotalSell;
                    } else {
                        groupSubTotalSell += finalTotalSell; 
                        groupSubTotalCost += (priceInfo.cost * quantity); 
                        groupSubTotalMargin += trueLineMargin;
                    }
                    itemsInGroupDisplayed++;
                    
                    const qtyDisplay = (key === 'support_package') ? '1' : `<span class="value-display"></span><input type="number" step="any" class="value-input hidden" />`;
                    const qtyClass = (key === 'support_package') ? '' : 'item-qty';
                    groupHTML += `<tr><td class="col-item item-name">${priceInfo.label}${itemResult.unit || ''}</td><td class="col-qty ${qtyClass}" data-key="${key}">${qtyDisplay}</td><td class="col-sell">£${finalUnitSell.toFixed(2)}</td><td class="col-total">£${finalTotalSell.toFixed(2)}</td><td class="col-margin">£${trueLineMargin.toFixed(2)}</td></tr>`;
                }
            });
            if (itemsInGroupDisplayed > 0) {
                resultsBody.innerHTML += `<tr class="group-header"><td colspan="5">${groupName.charAt(0).toUpperCase() + groupName.slice(1)}</td></tr>`;
                resultsBody.innerHTML += groupHTML;
                const finalGroupSell = (groupName === 'hardware' && excludeHardware) ? 0 : groupSubTotalSell;
                const finalGroupMargin = (groupName === 'hardware' && excludeHardware) ? 0 : groupSubTotalMargin;
                resultsBody.innerHTML += `<tr class="summary-row"><td colspan="3" style="text-align: right;">${groupName.charAt(0).toUpperCase() + groupName.slice(1)} Sub-Total:</td><td style="text-align: right;">£${finalGroupSell.toFixed(2)}</td><td style="text-align: right;">£${finalGroupMargin.toFixed(2)}</td></tr>`;
                subTotals[groupName] = { cost: (groupName === 'hardware' && excludeHardware) ? 0 : groupSubTotalCost, sell: finalGroupSell, margin: finalGroupMargin };
            }
        }
        
        document.querySelectorAll('.item-qty').forEach(cell => { const key = cell.dataset.key; if(key !== 'support_package') { updateCellDisplay(cell, key); cell.addEventListener('click', () => activateEditMode(cell, key)); const inputField = cell.querySelector('.value-input'); inputField.addEventListener('blur', () => deactivateEditMode(cell, key, true)); inputField.addEventListener('keydown', e => { if (e.key === 'Enter') deactivateEditMode(cell, key, true); else if (e.key === 'Escape') deactivateEditMode(cell, key, false); }); }});
        
        updateSupportTableSummaries(totalHardwareUnits);
        calculateAndDisplayGrandTotals(subTotals);
    }

    function calculateAndDisplayGrandTotals(subTotals) {
        const totalSell = subTotals.hardware.sell + subTotals.consumables.sell + subTotals.services.sell;
        const totalCost = subTotals.hardware.cost + subTotals.consumables.cost + subTotals.services.cost;
        const totalMargin = subTotals.hardware.margin + subTotals.consumables.margin + subTotals.services.margin;
        const totalReferralFee = totalSell - totalCost - totalMargin;
        const marginPercent = totalCost > 0 ? (totalMargin / totalCost) * 100 : 0;
        document.getElementById('total-cost').textContent = `£${totalCost.toFixed(2)}`;
        document.getElementById('total-sell').textContent = `£${totalSell.toFixed(2)}`;
        document.getElementById('total-margin-value').textContent = `£${totalMargin.toFixed(2)}`;
        document.getElementById('total-margin-percent').textContent = `(${marginPercent.toFixed(2)}%)`;
        document.getElementById('referral-fee-amount').textContent = `£${totalReferralFee.toFixed(2)}`;
    }
    
    function toggleMultiFloorUI() {
        const systemType = document.getElementById('system-type').value;
        const isNonDasQuatra = systemType === 'QUATRA' || systemType === 'QUATRA_EVO';
        const floorsGroup = document.getElementById('number-of-floors-group');
        const areaLabel = document.getElementById('floor-area-label');

        if (isNonDasQuatra) {
            floorsGroup.style.display = 'flex';
            areaLabel.textContent = 'Area per Floor';
        } else {
            floorsGroup.style.display = 'none';
            areaLabel.textContent = 'Floor Area';
        }
    }

    function calculateAntennas() {
        const pOpen=parseFloat(document.getElementById('percent-open').value)||0, pCubical=parseFloat(document.getElementById('percent-cubical').value)||0, pHollow=parseFloat(document.getElementById('percent-hollow').value)||0, pSolid=parseFloat(document.getElementById('percent-solid').value)||0;
        const sum = pOpen + pCubical + pHollow + pSolid;
        const sumSpan = document.getElementById('percentage-sum');
        sumSpan.textContent = `${sum.toFixed(0)}%`; sumSpan.style.color = (sum.toFixed(0) === "100") ? 'green' : 'red';
        
        const systemType=document.getElementById('system-type').value;
        const floorArea=parseFloat(document.getElementById('floor-area').value)||0;
        const unit=document.querySelector('input[name="unit-switch"]:checked').value;
        const band=document.querySelector('input[name="band-switch"]:checked').value;
        const isQuatra = systemType.includes('QUATRA');
        const isHighCeiling = document.getElementById('high-ceiling-warehouse').checked;
        const dataSource = isQuatra ? coverageData.quatra : coverageData.go;
        const coverage = dataSource[band]?.[unit];
        
        let antennasForArea = 0;
        if (floorArea > 0 && coverage) {
            if (isQuatra && isHighCeiling) {
                antennasForArea = floorArea / coverage.open_high_ceiling;
            } else {
                const percentages = { open: pOpen, cubical: pCubical, hollow: pHollow, solid: pSolid };
                antennasForArea = ((floorArea*(percentages.open/100))/coverage.open) + ((floorArea*(percentages.cubical/100))/coverage.cubical) + ((floorArea*(percentages.hollow/100))/coverage.hollow) + ((floorArea*(percentages.solid/100))/coverage.solid);
            }
        }

        let totalRequiredAntennas;
        const isNonDasQuatra = systemType === 'QUATRA' || systemType === 'QUATRA_EVO';

        if (isNonDasQuatra) {
            const numberOfFloors = parseInt(document.getElementById('number-of-floors').value) || 1;
            const roundedUpAntennasPerFloor = Math.ceil(antennasForArea);
            totalRequiredAntennas = roundedUpAntennasPerFloor * numberOfFloors;
        } else {
            totalRequiredAntennas = Math.ceil(antennasForArea);
        }

        document.getElementById('total-service-antennas').value = totalRequiredAntennas;
        runFullCalculation();
    }
    
    // --- INITIALIZATION ---
    function initialize() {
    const stateLoaded = loadStateFromURL(); // Add this line at the top

    document.getElementById('generate-link-btn').addEventListener('click', generateShareLink); // Add this line

    document.querySelectorAll('#floor-area, input[name="unit-switch"], input[name="band-switch"], .wall-percent, #high-ceiling-warehouse, #number-of-floors').forEach(input => {
            input.addEventListener('input', calculateAntennas);
            input.addEventListener('change', calculateAntennas);
        });
        
        document.getElementById('system-type').addEventListener('change', () => {
            toggleMultiFloorUI();
            calculateAntennas();
        });

        document.querySelectorAll('#number-of-networks, #max-antennas, #no-hardware-checkbox, #referral-fee-percent, #maintenance-percent').forEach(input => {
            input.addEventListener('input', runFullCalculation);
            input.addEventListener('change', runFullCalculation);
        });

        document.getElementById('reset-overrides').addEventListener('click', () => { for (const key in currentResults) { if (currentResults[key].hasOwnProperty('override')) currentResults[key].override = null; } setSupportPreset('none'); runFullCalculation(); });
        document.getElementById('toggle-zero-qty-btn').addEventListener('click', (e) => { showZeroQuantityItems = !showZeroQuantityItems; e.target.textContent = showZeroQuantityItems ? 'Hide Zero Qty Items' : 'Show All Items'; runFullCalculation(); });

        // Screenshot mode buttons
        const mainContainer = document.getElementById('main-container');
        document.getElementById('screenshot-btn').addEventListener('click', () => mainContainer.classList.add('screenshot-mode'));
        document.getElementById('return-btn').addEventListener('click', () => mainContainer.classList.remove('screenshot-mode'));

        loadPrices();
        setupSettingsModal();
        populateSupportTable();
        setSupportPreset('none');
        toggleMultiFloorUI();
       if (!stateLoaded) {
    // If we didn't load from a link, run the default calculation
    calculateAntennas();
} else {
    // If we DID load from a link, just run the full calculation to update the display
    runFullCalculation();
}
    }

    initialize();
// --- Shareable Link Logic ---

function generateShareLink() {
    // 1. Gather all the data needed to recreate the state
    const stateToSave = {
        version: 1,
        inputs: {
            systemType: document.getElementById('system-type').value,
            floorArea: document.getElementById('floor-area').value,
            numberOfFloors: document.getElementById('number-of-floors').value,
            unit: document.querySelector('input[name="unit-switch"]:checked').value,
            band: document.querySelector('input[name="band-switch"]:checked').value,
            percentOpen: document.getElementById('percent-open').value,
            percentCubical: document.getElementById('percent-cubical').value,
            percentHollow: document.getElementById('percent-hollow').value,
            percentSolid: document.getElementById('percent-solid').value,
            isHighCeiling: document.getElementById('high-ceiling-warehouse').checked,
            numberOfNetworks: document.getElementById('number-of-networks').value,
            maxAntennas: document.getElementById('max-antennas').value,
            excludeHardware: document.getElementById('no-hardware-checkbox').checked,
            referralFeePercent: document.getElementById('referral-fee-percent').value,
            maintenancePercent: document.getElementById('maintenance-percent').value,
        },
        overrides: {},
        pricing: priceData, // Save the exact pricing used for the quote
        supportSelections: {}
    };

    // Gather any overridden quantities
    for (const key in currentResults) {
        if (currentResults[key].override !== null) {
            stateToSave.overrides[key] = currentResults[key].override;
        }
    }

    // Gather support package selections
    document.querySelectorAll('.support-checkbox').forEach(box => {
        if(!stateToSave.supportSelections[box.dataset.key]) stateToSave.supportSelections[box.dataset.key] = {};
        stateToSave.supportSelections[box.dataset.key][box.dataset.tier] = box.checked;
    });
    document.querySelectorAll('.dpm-input').forEach(input => {
         if(!stateToSave.supportSelections[input.dataset.key]) stateToSave.supportSelections[input.dataset.key] = {};
        stateToSave.supportSelections[input.dataset.key].dpm = input.value;
    });

    // 2. Convert to JSON, compress, and encode
    const jsonString = JSON.stringify(stateToSave);
    const compressed = pako.deflate(jsonString, { to: 'string' });
    const encoded = btoa(compressed);

    // 3. Create the URL and show it to the user
    const url = new URL(window.location);
    url.hash = encoded;
    async function generateShareLink() {
    // 1. Gather all the data needed to recreate the state (this part is unchanged)
    const stateToSave = {
        version: 1,
        inputs: {
            systemType: document.getElementById('system-type').value,
            floorArea: document.getElementById('floor-area').value,
            numberOfFloors: document.getElementById('number-of-floors').value,
            unit: document.querySelector('input[name="unit-switch"]:checked').value,
            band: document.querySelector('input[name="band-switch"]:checked').value,
            percentOpen: document.getElementById('percent-open').value,
            percentCubical: document.getElementById('percent-cubical').value,
            percentHollow: document.getElementById('percent-hollow').value,
            percentSolid: document.getElementById('percent-solid').value,
            isHighCeiling: document.getElementById('high-ceiling-warehouse').checked,
            numberOfNetworks: document.getElementById('number-of-networks').value,
            maxAntennas: document.getElementById('max-antennas').value,
            excludeHardware: document.getElementById('no-hardware-checkbox').checked,
            referralFeePercent: document.getElementById('referral-fee-percent').value,
            maintenancePercent: document.getElementById('maintenance-percent').value,
        },
        overrides: {},
        pricing: priceData,
        supportSelections: {}
    };
    for (const key in currentResults) {
        if (currentResults[key].override !== null) {
            stateToSave.overrides[key] = currentResults[key].override;
        }
    }
    document.querySelectorAll('.support-checkbox').forEach(box => {
        if(!stateToSave.supportSelections[box.dataset.key]) stateToSave.supportSelections[box.dataset.key] = {};
        stateToSave.supportSelections[box.dataset.key][box.dataset.tier] = box.checked;
    });
     document.querySelectorAll('.dpm-input').forEach(input => {
         if(!stateToSave.supportSelections[input.dataset.key]) stateToSave.supportSelections[input.dataset.key] = {};
        stateToSave.supportSelections[input.dataset.key].dpm = input.value;
    });

    // 2. Convert to JSON, compress, and encode (this part is unchanged)
    const jsonString = JSON.stringify(stateToSave);
    const compressed = pako.deflate(jsonString, { to: 'string' });
    const encoded = btoa(compressed);

    // 3. Create the URL
    const url = new URL(window.location);
    url.hash = encoded;

    // 4. NEW: Copy to clipboard and provide user feedback
    try {
        await navigator.clipboard.writeText(url.href);

        // Give feedback to the user
        const button = document.getElementById('generate-link-btn');
        const originalText = button.innerHTML;
        button.innerHTML = 'Copied! ✅';
        button.disabled = true; // Briefly disable button

        // Change the text back after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);

    } catch (err) {
        console.error('Failed to copy link automatically: ', err);
        // If it fails, fall back to the old pop-up method
        prompt("Could not copy automatically. Please copy this link:", url.href);
    }
}
});

function updateSellPriceDisplay(key) {
    const costInput = document.getElementById(`cost-${key}`);
    const marginInput = document.getElementById(`margin-${key}`);
    const sellDisplay = document.getElementById(`sell-${key}`);
    const cost = parseFloat(costInput.value) || 0;
    const margin = parseFloat(marginInput.value) || 0;
    const sellPrice = cost * (1 + margin / 100);
    sellDisplay.textContent = `£${sellPrice.toFixed(2)}`;
}


function loadStateFromURL() {
    if (!window.location.hash) return false;

    try {
        const encoded = window.location.hash.substring(1);
        const compressed = atob(encoded);
        const jsonString = pako.inflate(compressed, { to: 'string' });
        const savedState = JSON.parse(jsonString);

        if(savedState.version !== 1) return false;

        // 1. Restore all inputs
        const { inputs, overrides, pricing, supportSelections } = savedState;
        document.getElementById('system-type').value = inputs.systemType;
        document.getElementById('floor-area').value = inputs.floorArea;
        document.getElementById('number-of-floors').value = inputs.numberOfFloors;
        document.getElementById(inputs.unit === 'sqm' ? 'unit-sqm' : 'unit-sqft').checked = true;
        document.getElementById(inputs.band === 'high_band' ? 'band-high' : 'band-low').checked = true;
        document.getElementById('percent-open').value = inputs.percentOpen;
        document.getElementById('percent-cubical').value = inputs.percentCubical;
        document.getElementById('percent-hollow').value = inputs.percentHollow;
        document.getElementById('percent-solid').value = inputs.percentSolid;
        document.getElementById('high-ceiling-warehouse').checked = inputs.isHighCeiling;
        document.getElementById('number-of-networks').value = inputs.numberOfNetworks;
        document.getElementById('max-antennas').value = inputs.maxAntennas;
        document.getElementById('no-hardware-checkbox').checked = inputs.excludeHardware;
        document.getElementById('referral-fee-percent').value = inputs.referralFeePercent;
        document.getElementById('maintenance-percent').value = inputs.maintenancePercent;

        // 2. Restore pricing and overrides
        priceData = pricing; // Use the exact pricing from the quote
        for (const key in overrides) {
            if(!currentResults[key]) currentResults[key] = { calculated: 0, override: null };
            currentResults[key].override = overrides[key];
        }

        // 3. Restore support selections
        if(supportSelections){
             document.querySelectorAll('.support-checkbox').forEach(box => {
                box.checked = supportSelections[box.dataset.key]?.[box.dataset.tier] || false;
            });
            document.querySelectorAll('.dpm-input').forEach(input => {
                input.value = supportSelections[input.dataset.key]?.dpm || supportData[input.dataset.key].dpm.toFixed(4);
            });
        }

        window.location.hash = ''; // Clear the hash to prevent re-loading
        return true; // Indicate that state was loaded

    } catch (e) {
        console.error("Could not load state from URL:", e);
        window.location.hash = ''; // Clear invalid hash
        return false;
    }
}
