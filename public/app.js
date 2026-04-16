const form = document.getElementById('sale-form');
const saleIdInput = document.getElementById('saleId');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');
const message = document.getElementById('message');
const rankingBody = document.getElementById('ranking-body');
const salesBody = document.getElementById('sales-body');
const totalSalesEl = document.getElementById('total-sales');
const sellersCountEl = document.getElementById('sellers-count');
const recordsCountEl = document.getElementById('records-count');
const leaderNameEl = document.getElementById('leader-name');
const paymentMethodSelect = document.getElementById('paymentMethod');
const needChangeSelect = document.getElementById('needChange');
const changeContainer = document.getElementById('change-container');
const paymentDateDay = document.getElementById('paymentDateDay');
const paymentDateMonth = document.getElementById('paymentDateMonth');
const paymentDateYear = document.getElementById('paymentDateYear');
const clearHistoryBtn = document.getElementById('clear-history-btn');

const ICONS = {
  crown: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m4 7 4 4 4-6 4 6 4-4" />
      <path d="M6 19h12" />
      <path d="M7 11h10l-1 6H8l-1-6Z" />
    </svg>
  `,
  check: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  `,
  edit: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  `,
  trash: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  `,
  clock: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  `,
};

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function encodeDataValue(text) {
  return encodeURIComponent(String(text || ''));
}

function decodeDataValue(text) {
  try {
    return decodeURIComponent(text || '');
  } catch {
    return text || '';
  }
}

function clearMessage() {
  message.textContent = '';
  message.className = 'message';
}

function resetForm() {
  saleIdInput.value = '';
  form.reset();
  form.quantity.value = 1;
  paymentMethodSelect.value = '';
  needChangeSelect.value = 'false';
  changeContainer.classList.add('hidden');
  paymentDateDay.value = '';
  paymentDateMonth.value = '';
  paymentDateYear.value = '';
  submitButton.textContent = 'Registrar Venda';
  cancelButton.classList.add('hidden');
}

function handlePaymentMethodChange() {
  if (paymentMethodSelect.value === 'Dinheiro') {
    changeContainer.classList.remove('hidden');
  } else {
    changeContainer.classList.add('hidden');
    needChangeSelect.value = 'false';
  }
}

function populateDateFields() {
  const currentYear = new Date().getFullYear();

  for (let day = 1; day <= 31; day += 1) {
    const option = document.createElement('option');
    option.value = String(day).padStart(2, '0');
    option.textContent = String(day).padStart(2, '0');
    paymentDateDay.appendChild(option);
  }

  for (let month = 1; month <= 12; month += 1) {
    const option = document.createElement('option');
    option.value = String(month).padStart(2, '0');
    option.textContent = String(month).padStart(2, '0');
    paymentDateMonth.appendChild(option);
  }

  for (let year = currentYear; year <= currentYear + 2; year += 1) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    paymentDateYear.appendChild(option);
  }
}

function showMessage(text, type = 'success') {
  message.textContent = text;
  message.className = `message ${type}`;
}

async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Erro na requisicao: ${response.status}`);
    }

    return data;
  } catch (error) {
    showMessage(error.message || 'Erro de comunicacao com o servidor.', 'error');
    return null;
  }
}

async function fetchRanking() {
  const ranking = await apiFetch('/api/ranking');
  if (!ranking) return [];

  if (!ranking.length) {
    rankingBody.innerHTML = `
      <div class="empty-state">
        <span>Nenhum vendedor no ranking ainda.</span>
      </div>
    `;
    return ranking;
  }

  rankingBody.innerHTML = ranking.map((item) => `
    <article class="ranking-item">
      <div class="ranking-item-main">
        <span class="ranking-position">${item.rank}</span>
        <div class="ranking-meta">
          <span class="ranking-name">${escapeHtml(item.sellerName)}</span>
          ${item.rank === 1 ? `<span class="ranking-crown">${ICONS.crown}</span>` : ''}
        </div>
      </div>
      <strong class="ranking-total">${item.totalQuantity}</strong>
    </article>
  `).join('');

  return ranking;
}

async function fetchSales() {
  const sales = await apiFetch('/api/sales');
  if (!sales) return [];

  if (!sales.length) {
    salesBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="9">Nenhum pedido registrado ate o momento.</td>
      </tr>
    `;
    return sales;
  }

  salesBody.innerHTML = sales.map((sale) => {
    const statusClass = sale.status === 'entregue' ? 'status-entregue' : 'status-pendente';
    const statusText = sale.status === 'entregue' ? 'Entregue' : 'Pendente';
    const deliverButton = sale.status === 'pendente'
      ? `<button type="button" class="action-button deliver-btn" data-id="${sale.id}" aria-label="Marcar pedido de ${escapeHtml(sale.customerName)} como entregue">${ICONS.check}</button>`
      : `<span class="action-icon action-icon-success" aria-hidden="true">${ICONS.check}</span>`;
    const observationRaw = sale.observation || '';
    const observation = escapeHtml(observationRaw);
    const observationPreview = observationRaw.length > 45
      ? `${escapeHtml(observationRaw.slice(0, 45))}...`
      : observation || '-';
    const addressRaw = sale.customerAddress || '';
    const address = escapeHtml(addressRaw);
    const addressPreview = addressRaw.length > 40
      ? `${escapeHtml(addressRaw.slice(0, 40))}...`
      : address;
    const rawPaymentMethod = String(sale.paymentMethod || '').trim().toLowerCase();
    const paymentLabel = rawPaymentMethod === 'dinheiro'
      ? `Dinheiro${sale.needChange ? ' (Troco)' : ''}`
      : rawPaymentMethod === 'pix'
        ? 'Pix'
        : (sale.paymentMethod ? escapeHtml(sale.paymentMethod) : '-');
    const paymentDate = sale.paymentDate ? escapeHtml(sale.paymentDate.split('-').reverse().join('/')) : '-';
    const statusIcon = sale.status === 'entregue' ? ICONS.check : ICONS.clock;

    return `
      <tr>
        <td>${escapeHtml(sale.sellerName)}</td>
        <td>${escapeHtml(sale.customerName)}</td>
        <td class="address-cell">
          <span class="address-preview" data-full-address="${encodeDataValue(addressRaw)}" title="Clique para ver o endereço completo">${addressPreview}</span>
        </td>
        <td>${sale.quantity}</td>
        <td class="payment-cell">
          <span class="payment-method">${paymentLabel}</span>
        </td>
        <td class="payment-date-cell">${paymentDate}</td>
        <td class="observation-cell">
          <span class="observation-preview" data-full-observation="${encodeDataValue(observationRaw)}" title="Clique para ver a observação completa">${observationPreview}</span>
        </td>
        <td><span class="status ${statusClass}">${statusIcon}${statusText}</span></td>
        <td class="actions-cell">
          <div class="action-set">
            ${deliverButton}
            <button
              type="button"
              class="action-button edit-btn"
              data-id="${sale.id}"
              data-seller="${encodeDataValue(sale.sellerName)}"
              data-customer="${encodeDataValue(sale.customerName)}"
              data-address="${encodeDataValue(sale.customerAddress)}"
              data-observation="${encodeDataValue(sale.observation || '')}"
              data-payment-method="${encodeDataValue(sale.paymentMethod)}"
              data-need-change="${sale.needChange}"
              data-payment-date="${encodeDataValue(sale.paymentDate || '')}"
              data-qty="${sale.quantity}"
              aria-label="Editar venda de ${escapeHtml(sale.sellerName)} para ${escapeHtml(sale.customerName)}"
            >
              ${ICONS.edit}
            </button>
            <button type="button" class="action-button delete-btn" data-id="${sale.id}" aria-label="Deletar venda de ${escapeHtml(sale.sellerName)} para ${escapeHtml(sale.customerName)}">
              ${ICONS.trash}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return sales;
}

function updateSummary(sales, ranking) {
  const totalQuantity = sales.reduce((sum, sale) => sum + Number(sale.quantity), 0);
  const sellers = new Set(sales.map((sale) => sale.sellerName));
  const leaderName = ranking.length ? ranking[0].sellerName : '-';

  totalSalesEl.textContent = totalQuantity;
  sellersCountEl.textContent = sellers.size;
  recordsCountEl.textContent = sales.length;
  leaderNameEl.textContent = leaderName;
}

async function loadData() {
  const [sales, ranking] = await Promise.all([fetchSales(), fetchRanking()]);
  if (!sales || !ranking) return;
  updateSummary(sales, ranking);
}

async function saveSale(saleData, method, url) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData),
  });

  if (response.ok) {
    resetForm();
    await loadData();
    showMessage(method === 'PUT' ? 'Venda atualizada com sucesso!' : 'Venda registrada com sucesso!');
  } else {
    const error = await response.json();
    showMessage(error.error || 'Erro ao salvar venda.', 'error');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();

  const paymentDateDayValue = form.paymentDateDay.value;
  const paymentDateMonthValue = form.paymentDateMonth.value;
  const paymentDateYearValue = form.paymentDateYear.value;
  const paymentDateValue = paymentDateDayValue && paymentDateMonthValue && paymentDateYearValue
    ? `${paymentDateYearValue}-${paymentDateMonthValue}-${paymentDateDayValue}`
    : '';

  const saleData = {
    sellerName: form.sellerName.value.trim(),
    customerName: form.customerName.value.trim(),
    customerAddress: form.customerAddress.value.trim(),
    observation: form.observation.value.trim(),
    paymentMethod: form.paymentMethod.value,
    needChange: form.needChange.value === 'true',
    paymentDate: paymentDateValue,
    quantity: Number(form.quantity.value),
  };

  if (!saleData.sellerName || !saleData.customerName || !saleData.customerAddress || !saleData.paymentMethod || !saleData.paymentDate || saleData.quantity < 1) {
    showMessage('Preencha todos os campos corretamente.', 'error');
    return;
  }

  const saleId = saleIdInput.value;
  if (saleId) {
    await saveSale(saleData, 'PUT', `/api/sales/${saleId}`);
  } else {
    await saveSale(saleData, 'POST', '/api/sales');
  }
});

cancelButton.addEventListener('click', () => {
  resetForm();
  clearMessage();
});

salesBody.addEventListener('click', async (event) => {
  const editButton = event.target.closest('.edit-btn');
  const deleteButton = event.target.closest('.delete-btn');
  const deliverButton = event.target.closest('.deliver-btn');

  if (editButton) {
    const id = editButton.dataset.id;
    form.sellerName.value = decodeDataValue(editButton.dataset.seller);
    form.customerName.value = decodeDataValue(editButton.dataset.customer);
    form.customerAddress.value = decodeDataValue(editButton.dataset.address);
    form.observation.value = decodeDataValue(editButton.dataset.observation);
    form.quantity.value = editButton.dataset.qty;
    form.paymentMethod.value = decodeDataValue(editButton.dataset.paymentMethod) || '';
    handlePaymentMethodChange();
    needChangeSelect.value = editButton.dataset.needChange === 'true' ? 'true' : 'false';

    const paymentDateValue = decodeDataValue(editButton.dataset.paymentDate);
    if (paymentDateValue) {
      const [year, month, day] = paymentDateValue.split('-');
      form.paymentDateDay.value = day || '';
      form.paymentDateMonth.value = month || '';
      form.paymentDateYear.value = year || '';
    } else {
      form.paymentDateDay.value = '';
      form.paymentDateMonth.value = '';
      form.paymentDateYear.value = '';
    }

    saleIdInput.value = id;
    submitButton.textContent = 'Atualizar Venda';
    cancelButton.classList.remove('hidden');
    showMessage('Modo de edicao ativado. Atualize os dados ou cancele.', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const observationPreview = event.target.closest('.observation-preview');
  if (observationPreview) {
    const fullObservation = decodeDataValue(observationPreview.dataset.fullObservation || '');
    if (fullObservation) {
      alert(`Observação completa:\n\n${fullObservation}`);
    }
    return;
  }

  const addressPreview = event.target.closest('.address-preview');
  if (addressPreview) {
    const fullAddress = decodeDataValue(addressPreview.dataset.fullAddress || '');
    if (fullAddress) {
      alert(`Endereço completo:\n\n${fullAddress}`);
    }
    return;
  }

  if (deleteButton) {
    const id = deleteButton.dataset.id;
    const confirmed = confirm('Deseja realmente deletar esta venda?');
    if (!confirmed) return;

    const response = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
    if (response.ok) {
      resetForm();
      await loadData();
      showMessage('Venda deletada com sucesso!');
    } else {
      showMessage('Erro ao deletar venda.', 'error');
    }
  }

  if (deliverButton) {
    const id = deliverButton.dataset.id;
    const response = await fetch(`/api/sales/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'entregue' }),
    });

    if (response.ok) {
      await loadData();
      showMessage('Pedido marcado como entregue!');
    } else {
      showMessage('Erro ao marcar como entregue.', 'error');
    }
  }
});

clearHistoryBtn.addEventListener('click', async () => {
  const confirmed = confirm('Deseja realmente limpar a lista de pedidos? Esta acao e irreversivel!');
  if (!confirmed) return;

  const finalConfirm = confirm('ATENCAO: Todos os pedidos serao permanentemente removidos. Tem certeza?');
  if (!finalConfirm) return;

  const response = await fetch('/api/sales/clean/all', { method: 'DELETE' });
  if (response.ok) {
    resetForm();
    await loadData();
    showMessage('Pedidos limpos com sucesso!');
  } else {
    showMessage('Erro ao limpar pedidos.', 'error');
  }
});

paymentMethodSelect.addEventListener('change', handlePaymentMethodChange);

window.addEventListener('load', () => {
  populateDateFields();
  loadData();
});
