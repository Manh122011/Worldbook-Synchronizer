import { escapeHtml } from '../utils.js';
import { isManageScriptCollapsed } from './settings.js';

let $manageScriptGlobalList;
let $manageScriptPresetList;
let $manageScriptCharacterList;
let $manageScriptEditPanel;
let currentScripts = [];
let currentScriptId = '';
let currentScriptType = '';
let renderDebounceTimer = null;

export function initManageScripts() {
  $manageScriptGlobalList = $('#wb-sync-manage-script-global-list');
  $manageScriptPresetList = $('#wb-sync-manage-script-preset-list');
  $manageScriptCharacterList = $('#wb-sync-manage-script-character-list');
  $manageScriptEditPanel = $('#wb-sync-manage-script-edit-panel');

  $('#wb-sync-manage-script-refresh-btn').on('click', debouncedRender);
  $('#wb-sync-manage-script-save-btn').on('click', handleSaveScript);
  $('#wb-sync-manage-script-cancel-btn').on('click', hideScriptEditPanel);

  $('#wb-sync-manage-script-edit-panel .wb-sync-edit-panel-header').on('click', function(e) {
    if ($(e.target).closest('.wb-sync-card-header-actions').length) return;
    const $panel = $(this).closest('.wb-sync-edit-panel-collapsible');
    $panel.toggleClass('collapsed');
  });

  $('#wb-sync-manage-script-view').on('click', '.wb-sync-manage-script-card-header', function() {
    const targetId = $(this).data('target');
    if (targetId && targetId.startsWith('wb-sync-manage-script')) {
      const $card = $(this).closest('.wb-sync-manage-script-card');
      $card.toggleClass('collapsed');
      const isCollapsed = $card.hasClass('collapsed');
      localStorage.setItem(`wb-sync-script-card-${targetId}`, được thu gọn ? 'thu gọn' : 'mở rộng');
    }
  });

  khôi phụcScriptCardStates();

  $('#wb-sync-manage-script-view').on('click', '.wb-sync-manage-script-item', function(e) {
    if ($(e.target).hasClass('wb-sync-manage-script-enabled') || 
        $(e.target).closest('.wb-sync-manage-script-actions').length) {
      trở lại;
    }
    const scriptId = $(this).data('script-id');
    const type = $(this).closest('.wb-sync-manage-script-card-content').attr('id').replace('wb-sync-manage-script-', '').replace('-list', '');
    openScriptEditPanel(scriptId, type);
  });

  $('#wb-sync-manage-script-view').on('change', '.wb-sync-manage-script-enabled', function(e) {
    e.stopPropagation();
    const scriptId = $(this).closest('.wb-sync-manage-script-item').data('script-id');
    const isEnabled = $(this).is(':checked');
    const type = $(this).closest('.wb-sync-manage-script-card-content').attr('id').replace('wb-sync-manage-script-', '').replace('-list', '');
    oggleScriptEnabled(scriptId, type, isEnabled);
  });

  $('#wb-sync-manage-script-view').on('click', '.wb-sync-manage-script-delete', function(e) {
    e.stopPropagation();
    const scriptId = $(this).closest('.wb-sync-manage-script-item').data('script-id');
    const type = $(this).closest('.wb-sync-manage-script-card-content').attr('id').replace('wb-sync-manage-script-', '').replace('-list', '');
    deleteScript(scriptId, type);
  });
}

hàm debouncedRender() {
  if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(() => {
    renderQuản lýScriptLists();
  }, 100);
}

hàm xuất renderQuản lýScriptLists() {
  if (!window.TavernHelper) {
    const msg = '<div class="wb-sync-empty-msg">TavernHelper không tải</div>';
    $manageScriptGlobalList.html(tin nhắn);
    $manageScriptPresetList.html(tin nhắn);
    $manageScriptCharacterList.html(msg);
    trở lại;
  }

  const isCharacterSelected = SillyTavern.getContext().characterId !== không xác định;
  
  const $characterCard = $('.wb-sync-manage-script-card-header[data-target="wb-sync-manage-script-character-list"]').closest('.wb-sync-manage-script-card');
  if (isCharacterSelected) {
    $characterCard.show();
  } khác {
    $characterCard.hide();
  }

  thử {
    const GlobalScripts = LoadScriptsWithCache('global');
    const PresetScripts = LoadScriptsWithCache('preset');
    const characterScripts = LoadScriptsWithCache('character');

    renderScriptList($manageScriptGlobalList, GlobalScripts, 'global');
    renderScriptList($manageScriptPresetList, presetScripts, 'preset');
    
    if (isCharacterSelected) {
      renderScriptList($manageScriptCharacterList, characterScripts, 'character');
    }
  } bắt (e) {
    console.error('Tải tập lệnh không thành công:', e);
    $manageScriptGlobalList.html('<div class="wb-sync-empty-msg">Tải không thành công</div>');
    $manageScriptPresetList.html('<div class="wb-sync-empty-msg">Tải không thành công</div>');
    $manageScriptCharacterList.html('<div class="wb-sync-empty-msg">Tải không thành công</div>');
  }
}

hàm tảiScriptsWithCache(type) {
  hãy để script = [];
  if (loại === 'toàn cầu') {
    scripts = window.TavernHelper.getScriptTrees({ type: 'global' }) || [];
  } else if (loại === 'đặt trước') {
    scripts = window.TavernHelper.getScriptTrees({ type: 'preset' }) || [];
  } else if (loại === 'ký tự') {
    scripts = window.TavernHelper.getScriptTrees({ type: 'character' }) || [];
  }
  
  const đã lưuOrder = JSON.parse(localStorage.getItem(`wb-sync-scripts-order-${type}`) || '[]');
  
  if (savedOrder.length > 0) {
    const scriptMap = Bản đồ mới();
    scripts.forEach(script => scriptMap.set(String(script.id), script));
    const được sắp xếpScripts = [];
    đã lưuOrder.forEach(id => {
      const script = scriptMap.get(String(id));
      if (tập lệnh) được sắp xếpScripts.push(tập lệnh);
    });
    scripts.forEach(script => {
      if (!sortedScripts.find(s => s.id === script.id)) {
        đã sắp xếpScripts.push(tập lệnh);
      }
    });
    trả về các tập lệnh đã sắp xếp;
  } khác {
    return scripts.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }
}

hàm renderScriptList($container, scripts,type) {
  if (scripts.length === 0) {
    $container.html('<div class="wb-sync-empty-msg">Không có tập lệnh. </div>');
    trở lại;
  }

  đoạn const = document.createDocumentFragment();
  scripts.forEach(script => {
    const div = document.createElement('div');
    div.className = 'wb-sync-manage-script-item';
    div.setAttribution('data-script-id', script.id);
    div.innerHTML = `
      <div class="wb-sync-manage-script-info">
        <input type="checkbox" class="wb-sync-manage-script-enabled" ${script.enabled !== false ? 'checked' : ''}>
        <span class="wb-sync-manage-script-name">${escapeHtml(script.name || 'Tập lệnh chưa được đặt tên')</span>
      </div>
      <lớp div="wb-sync-manage-script-actions">
        <button class="wb-sync-button wb-sync-btn-small wb-sync-manage-script-delete"> xóa bỏ</button>
      </div>
    `;
    đoạn.appendChild(div);
  });
  $container.empty().append(đoạn);
}

hàm không đồng bộ chuyển đổiScriptEnabled(scriptId, type, isEnabled) {
  thử {
    đang chờ window.TavernHelper.updateScriptTreesWith(scripts => {
      const script = scripts.find(s => s.id === scriptId);
      if (script) script.enabled = isEnabled;
      trả lại tập lệnh;
    }, { loại: loại });
    toastr.success(isEnabled ? 'Đã bật tập lệnh' : 'Tập lệnh bị vô hiệu hóa');
  } bắt (e) {
    toastr.error('Cập nhật không thành công:' + e.message);
    renderQuản lýScriptLists();
  }
}

hàm không đồng bộ openScriptEditPanel(scriptId, type) {
  thử {
    const scripts = đang chờ window.TavernHelper.getScriptTrees({ type: type }) || [];
    const script = scripts.find(s => s.id === scriptId);
    if (!script) trả về;

    currentScripts = tập lệnh;
    currentScriptId = scriptId;
    currentScriptType = loại;

    $('#wb-sync-manage-script-id').val(script.id);
    $('#wb-sync-manage-script-name').val(script.name || '');
    $('#wb-sync-manage-script-content').val(script.content || '');
    $('#wb-sync-manage-script-info').val(script.info || '');
    $('#wb-sync-manage-script-enabled').prop('checked', script.enabled !== false);

    $manageScriptEditPanel.removeClass('collapsed').show();
    $manageScriptEditPanel.find('.wb-sync-manage-script-edit-title').text(`Chỉnh sửa ${type === 'global' ? 'tình hình chung' : type === 'preset' ? 'Mặc định' : 'Vai trò'}Kịch bản`);
  } bắt (e) {
    toastr.error('Tải tập lệnh không thành công:' + e.message);
  }
}

hàm ẩnScriptEditPanel() {
  $manageScriptEditPanel.removeClass('collapsed').hide();
  currentScriptId = '';
  currentScriptType = '';
}

hàm không đồng bộ handSaveScript() {
  if (!currentScriptId || !currentScriptType) trả về;

  thử {
    đang chờ window.TavernHelper.updateScriptTreesWith(scripts => {
      const script = scripts.find(s => s.id === currentScriptId);
      nếu (tập lệnh) {
        script.name = $('#wb-sync-manage-script-name').val();
        script.content = $('#wb-sync-manage-script-content').val();
        script.info = $('#wb-sync-manage-script-info').val();
        script.enabled = $('#wb-sync-manage-script-enabled').is(':checked');
      }
      trả lại tập lệnh;
    }, { type: currentScriptType });

    toastr.success('Đã lưu thành công!');
    ẩnScriptEditPanel();
    renderQuản lýScriptLists();
  } bắt (e) {
    toastr.error('Lưu không thành công:' + e.message);
  }
}

hàm khôi phụcScriptCardStates() {
  thẻ const = [
    'wb-sync-manage-script-global-list',
    'wb-sync-manage-script-preset-list',
    'wb-sync-manage-script-character-list'
  ];

  const defaultCollapsed = isManagerScriptCollapsed();

  cards.forEach(cardId => {
    const đã lưuState = localStorage.getItem(`wb-sync-script-card-${cardId}`);
    if (savedState === 'thu gọn' || (savedState === null && defaultCollapsed)) {
      $(`.wb-sync-manage-script-card-header[data-target="${cardId}"]`).closest('.wb-sync-manage-script-card').addClass('collapsed');
    }
  });
}

async function deleteScript(scriptId, type) {
  if (!confirm('Bạn có chắc chắn muốn xóa tập lệnh này?')) return;

  try {
    await window.TavernHelper.updateScriptTreesWith(scripts => {
      return scripts.filter(s => s.id !== scriptId);
    }, { type: type });

    toastr.success('Xóa thành công');
    renderManageScriptLists();
    if (currentScriptId === scriptId) hideScriptEditPanel();
  } catch (e) {
    toastr.error('Xóa không thành công:' + e.message);
  }
}

export function cleanup() {
  if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
}