import { getAllLorebooks, getLorebookEntries, setLorebookEntries, getLorebookSettings, getTavernHelper } from '../api.js';
import { escapeHtml } from '../utils.js';
import { isManageWbCollapsed } from './settings.js';

let $manageWbList;
let $manageWbEntriesList;
let $manageWbEditPanel;
let currentEntries = [];
let currentBookName = '';
let renderDebounceTimer = null;

export function initManageWorldbook() {
  $manageWbList = $('#wb-sync-manage-wb-list');
  $manageWbEntriesList = $('#wb-sync-manage-wb-entries-list');
  $manageWbEditPanel = $('#wb-sync-manage-wb-edit-panel');

  $('#wb-sync-manage-wb-refresh-btn').on('click', debouncedRender);
  $('#wb-sync-manage-wb-create-btn').on('click', handleCreateWorldbook);
  $('#wb-sync-manage-wb-delete-btn').on('click', handleDeleteSelectedWorldbooks);
  $('#wb-sync-manage-wb-select-all-btn').on('click', toggleSelectAllWorldbooks);

  $('#wb-sync-manage-wb-entry-create-btn').on('click', handleCreateEntry);
  $('#wb-sync-manage-wb-entry-delete-btn').on('click', handleDeleteSelectedEntries);
  $('#wb-sync-manage-wb-entry-select-all-btn').on('click', toggleSelectAllEntries);
  $('#wb-sync-manage-wb-save-entry-btn').on('click', handleSaveEntry);
  $('#wb-sync-manage-wb-cancel-entry-btn').on('click', hideEntryEditPanel);

  $('#wb-sync-manage-wb-view').on('click', '.wb-sync-manage-script-card-header', function() {
    const targetId = $(this).data('target');
    if (targetId && targetId.startsWith('wb-sync-manage-wb')) {
      const $card = $(this).closest('.wb-sync-manage-script-card');
      $card.toggleClass('collapsed');
      const isCollapsed = $card.hasClass('collapsed');
      localStorage.setItem(`wb-sync-wb-card-${targetId}`, được thu gọn ? 'thu gọn' : 'mở rộng');
    }
  });

  khôi phụcWbCardStates();

  $('#wb-sync-manage-wb-view').on('click', '.wb-sync-manage-wb-item', function(e) {
    if ($(e.target).hasClass('wb-sync-manage-wb-checkbox') || 
        $(e.target).closest('.wb-sync-manage-wb-actions').length) {
      trở lại;
    }
    const bookName = $(this).data('book-name');
    LoadWorldbookEntries(bookName);
  });

  $('#wb-sync-manage-wb-view').on('change', '.wb-sync-manage-wb-checkbox', function(e) {
    e.stopPropagation();
    const bookName = $(this).closest('.wb-sync-manage-wb-item').data('book-name');
    const isChecked = $(this).is(':checked');
    chuyển đổiWorldbookEnabled(bookName, isChecked);
  });

  $('#wb-sync-manage-wb-view').on('click', '.wb-sync-manage-wb-delete', function(e) {
    e.stopPropagation();
    const bookName = $(this).closest('.wb-sync-manage-wb-item').data('book-name');
    xóaSingleWorldbook(bookName);
  });

  $('#wb-sync-manage-wb-view').on('click', '.wb-sync-manage-entry-item', function(e) {
    if ($(e.target).hasClass('wb-sync-manage-entry-checkbox') || 
        $(e.target).closest('.wb-sync-manage-entry-actions').length) {
      trở lại;
    }
    const uid = $(this).data('uid');
    openEntryEditPanel(uid);
  });

  $('#wb-sync-manage-wb-view').on('click', '.wb-sync-manage-entry-delete', function(e) {
    e.stopPropagation();
    const uid = $(this).closest('.wb-sync-manage-entry-item').data('uid');
    xóaSingleEntry(uid);
  });

  $('#wb-sync-manage-wb-entry-position').on('change', function() {
    const val = $(this).val();
    $('#wb-sync-manage-wb-entry-deep-container').css('display', val.startsWith('at_deep') ? 'flex' : 'none');
  });
}

hàm debouncedRender() {
  if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(() => {
    renderQuản lýWorldbookList();
  }, 100);
}

xuất hàm không đồng bộ renderQuản lýWorldbookList() {
  $manageWbList.html('<div class="wb-sync-empty-msg">Đang tải...</div>');
  thử {
    const [sách, cài đặt] = đang chờ Promise.all([getAllLorebooks(), getLorebookSettings()]);
    const EnableBooks = Bộ mới(settings.selected_global_lorebooks);

    if (books.length === 0) {
      $manageWbList.html('<div class="wb-sync-empty-msg">Không tìm thấy sách thế giới. </div>');
      trở lại;
    }

    đoạn const = document.createDocumentFragment();
    books.forEach(book => {
      const isEnabled = EnableBooks.has(book.file_name);
      const div = document.createElement('div');
      div.className = 'wb-sync-manage-wb-item';
      div.setAttribution('data-book-name', book.file_name);
      div.innerHTML = `
        <div class="wb-sync-manage-wb-info">
          <input type="checkbox" class="wb-sync-manage-wb-checkbox" ${isEnabled ? 'checked' : ''} title="bật/tắt">
          <span class="wb-sync-manage-wb-name">${escapeHtml(book.name)</span>
        </div>
        <div class="wb-sync-manage-wb-actions">
          <button class="wb-sync-button wb-sync-btn-small wb-sync-manage-wb-delete">Đồng bộ hóa</button>
        </div>
      `;
      đoạn.appendChild(div);
    });

    $manageWbList.empty().append(đoạn);
  } bắt (e) {
    $manageWbList.html(`<div class="wb-sync-empty-msg" style="color:red;">Tải không thành công:${e.message</div>`);
  }
}

chức năng không đồng bộ chuyển đổiWorldbookEnabled(bookName, isEnabled) {
  thử {
    const curSettings = đang chờ getLorebookSettings();
    hãy bật = curSettings.selected_global_lorebooks || [];

    nếu (được kích hoạt) {
      if (!enabled.includes(bookName))enabled.push(bookName);
    } khác {
      đã bật = đã bật.filter(n => n !== bookName);
    }

    đang chờ setLorebookSettings({ selected_global_lorebooks: đã bật });
    toastr.success(isEnabled ? 'Đã bật sách thế giới' : 'Sách thế giới bị vô hiệu hóa');
  } catch (e) {
    toastr.error('Cập nhật không thành công:' + e.message);
    renderManageWorldbookList();
  }
}

async function loadWorldbookEntries(bookName) {
  currentBookName = bookName;
  $manageWbEntriesList.html('<div class="wb-sync-empty-msg">Đang tải...</div>');
  $manageWbList.find('.wb-sync-manage-wb-item').removeClass('active');
  $manageWbList.find(`[data-book-name="${escapeHtml(bookName)}"]`).addClass('active');
  hideEntryEditPanel();

  try {
    const entries = await getLorebookEntries(bookName);
    const savedOrder = JSON.parse(localStorage.getItem(`wb-sync-entries-order-${bookName}`) || '[]');
    
    if (savedOrder.length > 0) {
      const entryMap = Bản đồ mới();
      Entry.forEach(entry => entryMap.set(String(entry.uid), entry));
      const được sắp xếpEntries = [];
      đã lưuOrder.forEach(uid => {
        const entry = entryMap.get(String(uid));
        if (mục nhập) được sắp xếpEntries.push(entry);
      });
      mục.forEach(entry => {
        if (!sortedEntries.find(e => e.uid === entry.uid)) {
          đã sắp xếpEntries.push(entry);
        }
      });
      currentEntries = đã sắp xếpEntries;
    } khác {
      mục.sort((a, b) => {
        const orderA = a.position?.order ?? a.đặt hàng ?? 100;
        const orderB = b.position?.order ?? b.đặt hàng ?? 100;
        return orderA - orderB;
      });
      currentEntries = mục;
    }

    if (currentEntries.length === 0) {
      $manageWbEntriesList.html('<div class="wb-sync-empty-msg">Cuốn sách thế giới này không có mục nào. </div>');
      trở lại;
    }

    renderEntriesList(currentEntries);
  } bắt (e) {
    $manageWbEntriesList.html(`<div class="wb-sync-empty-msg" style="color:red;">Tải không thành công: ${e.message</div>`);
  }
}

hàm getPositionLabel(entry) {
  const pos = entry.position || {};
  loại const = pos.type || 'trước_tác giả_note';
  nhãn const = {
    'trước_character_def định': 'Trước định nghĩa ký tự',
    'after_character_def định': 'Sau định nghĩa ký tự',
    'trước_example_messages': 'trước các tin nhắn mẫu',
    'after_example_messages': 'Sau các tin nhắn mẫu',
    'Before_author_note': 'Trước ghi chú của tác giả',
    'after_author_note': 'Sau ghi chú của tác giả',
    'ở_độ sâu': `@D${pos.depth || 4}`
  };
  nhãn trả lại[loại] || kiểu;
}

hàm renderEntriesList(entry) {
  đoạn const = document.createDocumentFragment();
  mục.forEach(entry => {
    const isConstant = entry.type === 'hằng số' || (entry.strategy && entry.strategy.type === 'hằng số');
    const typeLabel = isConstant ? '<span class="wb-sync-badge wb-sync-badge-blue">Ánh sáng xanh</span>' : '<span class="wb-sync-badge wb-sync-badge-green">đèn xanh</span>';
    const posLabel = getPositionLabel(entry);
    const order = entry.position?.order || entry.order || 100;
    const prob = entry.probability !== không xác định ? khả năng vào lệnh: 100;
    const div = document.createElement('div');
    div.className = 'wb-sync-manage-entry-item';
    div.setAttribution('data-uid', entry.uid);
    div.innerHTML = `
      <div class="wb-sync-manage-entry-info">
        <input type="checkbox" class="wb-sync-manage-entry-checkbox" data-uid="${entry.uid}">
        ${typeLabel}
        <span class="wb-sync-manage-entry-name">${escapeHtml(entry.comment || entry.name || `UID:${entry.uid}`)</span>
        <span class="wb-sync-entry-meta" style="margin-left: 10px; color: var(--wb-sync-text-muted); cỡ chữ: 0,85em;">
          ${posLabel} · Đơn hàng${order} · Xác suất${prob}%
        </span>
      </div>
      <lớp div="wb-sync-manage-entry-actions">
        <button class="wb-sync-button wb-sync-btn-small wb-sync-manage-entry-delete">Đồng bộ hóa</button>
      </div>
    `;
    đoạn.appendChild(div);
  });
  $manageWbEntriesList.empty().append(đoạn);
}

hàm openEntryEditPanel(uid) {
  const entry = currentEntries.find(e => e.uid == uid);
  if (!entry) trả về;

  $('#wb-sync-manage-wb-entry-uid').val(entry.uid);
  $('#wb-sync-manage-wb-entry-name').val(entry.comment || entry.name || '');
  
  const keys = entry.strategy && entry.strategy.keys ? entry.strategy.keys : (entry.key || []);
  $('#wb-sync-manage-wb-entry-keys').val(keys.join(', '));
  $('#wb-sync-manage-wb-entry-content').val(entry.content || '');

  const mode = entry.strategy && entry.strategy.type ? entry.strategy.type : (entry.type === 'constant' ? 'constant' : 'selective');
  $('#wb-sync-manage-wb-entry-mode').val(mode);

  let posVal = 'before_author_note';
  let showDepth = false;
  if (entry.position && entry.position.type) {
    if (entry.position.type === 'at_depth') {
      posVal = `at_depth_${entry.position.role || 'system'}`;
      $('#wb-sync-manage-wb-entry-deep').val(entry.position.deep || 4);
      showDepth = đúng;
    } khác {
      posVal = entry.position.type;
    }
  }
  $('#wb-sync-manage-wb-entry-position').val(posVal);
  $('#wb-sync-manage-wb-entry-deep-container').css('display', showDepth ? 'flex' : 'none');

  $('#wb-sync-manage-wb-entry-order').val(entry.position && entry.position.order !== không xác định ? entry.position.order : (entry.order || 100));
  $('#wb-sync-manage-wb-entry-prob').val(entry.probability !== không xác định ? entry.probability : 100);

  const pIn = entry.recursion ? entry.recursion.prevent_incoming : (entry.prevent_recursion || false);
  const pOut = entry.recursion ? entry.recursion.prevent_outending : (entry.prevent_recursion || false);
  $('#wb-sync-manage-wb-entry-prevent-in').prop('checked', pIn);
  $('#wb-sync-manage-wb-entry-prevent-out').prop('checked', pOut);

  $manageWbEditPanel.show();
}

hàm ẩnEntryEditPanel() {
  $manageWbEditPanel.hide();
  $('#wb-sync-manage-wb-entry-uid').val('');
}

hàm không đồng bộ xử lýSaveEntry() {
  const uid = $('#wb-sync-manage-wb-entry-uid').val();
  if (!uid || !currentBookName) return;

  thử {
    const mục = đang chờ getLorebookEntries(currentBookName);
    const idx =entry.findIndex(e => e.uid == uid);
    if (idx === -1) ném Lỗi mới('Không tìm thấy mục nhập');

    const e = mục [idx];
    e.comment = $('#wb-sync-manage-wb-entry-name').val();
    e.name = e.comment;
    e.content = $('#wb-sync-manage-wb-entry-content').val();

    const keyStr = $('#wb-sync-manage-wb-entry-keys').val();
    const keyArr = keyStr ? keyStr.split(',').map(k => k.trim()).filter(k => k) : [];

    if (!e.strategy) e.strategy = {};
    e.strategy.type = $('#wb-sync-manage-wb-entry-mode').val();
    e.strategy.keys = keyArr;
    e.type = e.strategy.type === 'không đổi' ? 'hằng' : 'Bình thường';
    e.key = keyArr;

    const posVal = $('#wb-sync-manage-wb-entry-position').val();
    if (!e.position || typeof e.position !== 'object') e.position = { order: e.order || 100 };

    if (posVal.startsWith('at_deep')) {
      e.position.type = 'at_deep';
      e.position.role = posVal.split('_')[2];
      e.position.deep = ParseInt($('#wb-sync-manage-wb-entry-Deep').val()) || 4;
    } khác {
      e.position.type = posVal;
    }

    e.position.order = ParseInt($('#wb-sync-manage-wb-entry-order').val()) || 100;
    e.order = e.position.order;
    e.probability = ParseInt($('#wb-sync-manage-wb-entry-prob').val());
    if (isNaN(e.probability)) e.probability = 100;

    if (!e.recursion) e.recursion = {};
    e.recursion.prevent_incoming = $('#wb-sync-manage-wb-entry-prevent-in').is(':checked');
    e.recursion.prevent_outending = $('#wb-sync-manage-wb-entry-prevent-out').is(':checked');

    đang chờ setLorebookEntries(currentBookName,entry);
    toastr.success('保存成功!');
    ẩnEntryEditPanel();
    LoadWorldbookEntries(currentBookName);
  } bắt (e) {
    toastr.error('保存失败:' + e.message);
  }
}

hàm không đồng bộ xử lýCreateEntry() {
  if (!currentBookName) return toastr.warning('Vui lòng chọn Sách thế giới trước');
  
  tên const = dấu nhắc('请输入条目名称:');
  if (!name) trả về;

  thử {
    const mục = đang chờ getLorebookEntries(currentBookName);
    const newEntry = {
      tên: tên,
      nhận xét: tên,
      nội dung: '',
      đã bật: đúng,
      chiến lược: { type: 'chọn lọc', phím: [], scan_deep: 'same_as_global' },
      vị trí: { type: 'trước_author_note', thứ tự: 100 },
      xác suất: 100,
      đệ quy: { Prevent_incoming: false, Prevent_outending: false, delay_until: null },
      hiệu ứng: { dính: null, thời gian hồi chiêu: null, độ trễ: null },
    };
    mục.push(newEntry);
    đang chờ setLorebookEntries(currentBookName,entry);
    toastr.success('创建成功!');
    LoadWorldbookEntries(currentBookName);
  } bắt (e) {
    toastr.error('创建失败:' + e.message);
  }
}

chức năng khôi phụcWbCardStates() {
  thẻ const = [
    'wb-sync-manage-wb-books-card',
    'wb-sync-manage-wb-entry-card'
  ];

  const defaultCollapsed = isManagerWbCollapsed();

  cards.forEach(cardId => {
    const đã lưuState = localStorage.getItem(`wb-sync-wb-card-${cardId}`);
    if (savedState === 'collapsed' || (savedState === null && defaultCollapsed)) {
      $(`.wb-sync-manage-script-card-header[data-target="${cardId}"]`).closest('.wb-sync-manage-script-card').addClass('collapsed');
    }
  });
}

hàm không đồng bộ xử lýCreateWorldbook() {
  const name = nhắc ('Xin vui lòng nhập tên của Sách Thế giới mới:');
  if (!name || !name.trim()) trả về;
  thử {
    const api = đang chờ getTavernHelper();
    đang chờ api.createWorldbook(name.trim());
    toastr.success(`Sách thế giới "${name}" Đã tạo thành công! `);
    renderQuản lýWorldbookList();
  } bắt (e) {
    toastr.error(`Tạo không thành công: ${e.message}`);
  }
}

chức năng không đồng bộ xóaSingleWorldbook(bookName) {
  if (!confirm(`Xác nhận xóa sách thế giới "${bookName}"？`)) trở lại;
  thử {
    const api = đang chờ getTavernHelper();
    đang chờ api.deleteWorldbook(bookName);
    toastr.success('Xóa thành công');
    renderQuản lýWorldbookList();
    $manageWbEntriesList.html('<div class="wb-sync-empty-msg">Vui lòng chọn Sách thế giới ở bên trái trước. </div>');
    ẩnEntryEditPanel();
    currentBookName = '';
    currentEntries = [];
  } bắt (e) {
    toastr.error('Xóa không thành công: ' + e.message);
  }
}

chức năng không đồng bộ xử lýDeleteSelectedWorldbooks() {
  const đã chọn = $manageWbList.find('.wb-sync-manage-wb-checkbox:checked').closest('.wb-sync-manage-wb-item');
  if (selected.length === 0) return toastr.warning('Hãy chọn sách thế giới cần xóa');
  
  const bookNames = selected.map((_, el) => $(el).data('book-name')).get();
  if (!confirm(`Bạn có chắc chắn muốn xóa ${bookNames.length} sách thế giới?`)) return;

  thử {
    const api = đang chờ getTavernHelper();
    for (tên hằng của bookNames) {
      đang chờ api.deleteWorldbook(name);
    }
    toastr.success('Xóa thành công');
    renderQuản lýWorldbookList();
    $manageWbEntriesList.html('<div class="wb-sync-empty-msg">Vui lòng chọn Sách thế giới ở bên trái trước. </div>');
    hideEntryEditPanel();
    currentBookName = '';
    currentEntries = [];
  } catch (e) {
    toastr.error('Xóa không thành công:' + e.message);
  }
}

function toggleSelectAllWorldbooks() {
  const checkboxes = $manageWbList.find('.wb-sync-manage-wb-checkbox');
  const allChecked = checkboxes.length === checkboxes.filter(':checked').length;
  checkboxes.prop('checked', !allChecked);
}

async function deleteSingleEntry(uid) {
  if (!currentBookName) return;
  if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;

  try {
    const api = await getTavernHelper();
    await api.deleteWorldbookEntries(currentBookName, entry => entry.uid === parseInt(uid), { render: 'debounced' });
    toastr.success('Xóa thành công');
    loadWorldbookEntries(currentBookName);
  } catch (e) {
    toastr.error('Xóa không thành công:' + e.message);
  }
}

async function handleDeleteSelectedEntries() {
  if (!currentBookName) return toastr.warning('Vui lòng chọn Sách thế giới trước');
  
  const selected = $manageWbEntriesList.find('.wb-sync-manage-entry-checkbox:checked');
  if (selected.length === 0) return toastr.warning('Vui lòng chọn mục cần xóa');

  const uids = selected.map((_, el) => parseInt($(el).data('uid'))).lấy();
  if (!confirm(`Bạn có chắc chắn muốn xóa các mục ${uids.length}?`)) return;

  thử {
    const api = đang chờ getTavernHelper();
    đang chờ api.deleteWorldbookEntries(currentBookName, entry => uids.includes(entry.uid), { render: 'debounced' });
    toastr.success('Xóa thành công');
    loadWorldbookEntries(currentBookName);
  } catch (e) {
    toastr.error('Xóa không thành công:' + e.message);
  }
}

function toggleSelectAllEntries() {
  const checkboxes = $manageWbEntriesList.find('.wb-sync-manage-entry-checkbox');
  const allChecked = checkboxes.length === checkboxes.filter(':checked').length;
  checkboxes.prop('checked', !allChecked);
}

export function cleanup() {
  if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
}