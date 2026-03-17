import { getAllLorebooks, getLorebookSettings, setLorebookSettings, getLorebookEntries, getTavernHelper } from '../api.js';
import { escapeHtml } from '../utils.js';
import { showLoader, hideLoader } from '../ui.js';
import { loadEntriesForSelectedBooks } from './entries.js';

let $bookList;
let $worldbookListContainer;
let $dupSourceSelect;
let $dupTargetInput;
let $dupSubmitBtn;
let $renameSourceSelect;
let $renameTargetInput;
let $renameSubmitBtn;

export function initWorldbook() {
  $bookList = $('#wb-sync-book-list');
  $worldbookListContainer = $('#wb-sync-worldbook-list-container');
  $dupSourceSelect = $('#wb-sync-dup-source-select');
  $dupTargetInput = $('#wb-sync-dup-target-input');
  $dupSubmitBtn = $('#wb-sync-duplicate-submit-btn');
  $renameSourceSelect = $('#wb-sync-rename-source-select');
  $renameTargetInput = $('#wb-sync-rename-target-input');
  $renameSubmitBtn = $('#wb-sync-rename-submit-btn');

  $('#wb-sync-delete-worldbook-btn').on('click', handleDeleteWorldbooks);
  $dupSubmitBtn.on('click', handleDuplicateWorldbook);
  $renameSubmitBtn.on('click', handleRenameWorldbook);

  $bookList.on('click', '.wb-sync-book-button', async function () {
    const $this = $(this);
    const bookFilename = $this.data('book-filename');
    const isSelected = $this.hasClass('selected');

    $this.toggleClass('selected');

    try {
      const curSettings = await getLorebookSettings();
      let enabled = curSettings.selected_global_lorebooks || [];

      if (isSelected) {
        enabled = enabled.filter(n => n !== bookFilename);
      } else if (!enabled.includes(bookFilename)) {
        enabled.push(bookFilename);
      }

      await setLorebookSettings({ selected_global_lorebooks: enabled });
    } catch (e) {
      $this.toggleClass('selected');
      toastr.error('Không thể cập nhật trạng thái sách thế giới');
    }
  });

  $worldbookListContainer.on('click', '.wb-sync-book-button', function () {
    $(this).toggleClass('selected');
    loadEntriesForSelectedBooks();
  });
}

export async function renderWorldBooks() {
  $bookList.empty().append('<p>đang tải...</p>');
  try {
    const [allBooks, settings] = await Promise.all([getAllLorebooks(), getLorebookSettings()]);
    const enabledBooks = new Set(settings.selected_global_lorebooks);

    if (allBooks.length === 0) {
      $bookList.html('<p>Không tìm thấy sách thế giới.</p>');
      return;
    }

    const buttonsHtml = allBooks.map(book => {
      const isEnabled = enabledBooks.has(book.file_name);
      return `<button class="wb-sync-book-button ${isEnabled ? 'selected' : ''}" data-book-filename="${escapeHtml(book.file_name)}">${escapeHtml(book.name)}</button>`;
    }).join('');

    $bookList.html(buttonsHtml);

  } catch (e) {
    $bookList.empty().append(`<p style="color:red;">Tải không thành công: ${e.message}</p>`);
  }
}

export async function renderDeleteView() {
  try {
    const books = await getAllLorebooks();
    $worldbookListContainer.empty();
    if (books.length === 0) return $worldbookListContainer.append('<p>không tìm thấy sách thế giới.</p>');
    let html = '';
    books.forEach(b => {
      html += `<button class="wb-sync-book-button" data-book-name="${escapeHtml(b.file_name)}">${escapeHtml(b.name)}</button>`;
    });
    $worldbookListContainer.html(html);
  } catch (e) {
    toastr.error('Tải không thành công');
  }
  loadEntriesForSelectedBooks();
}

export async function handleDeleteWorldbooks() {
  const selected = $worldbookListContainer
    .find('.selected')
    .map((_, el) => $(el).data('book-name'))
    .get();
  if (selected.length === 0) return toastr.warning('Hãy chọn sách thế giới để xóa');
  if (confirm(`Xác nhận xóa vĩnh viễn ${selected.length} sách thế giới？`)) {
    try {
      const api = await getTavernHelper();
      for (const name of selected) await api.deleteLorebook(name);
      toastr.success('Xóa thành công');
      renderDeleteView();
    } catch (e) {
      toastr.error('Xóa không thành công');
    }
  }
}

export async function populateDuplicateSelect() {
  try {
    const books = await getAllLorebooks();
    $dupSourceSelect.empty().append('<option value="">--Hãy chọn nguồn sách thế giới--</option>');
    books.forEach(b => $dupSourceSelect.append(`<option value="${escapeHtml(b.file_name)}">${escapeHtml(b.name)}</option>`));
  } catch (e) {
    toastr.error('Tải không thành công');
  }
}

export async function handleDuplicateWorldbook() {
  const source = $dupSourceSelect.val();
  const target = $dupTargetInput.val().trim();
  if (!source) return toastr.warning('Hãy chọn nguồn sách thế giới');
  if (!target) return toastr.warning('Vui lòng nhập tên Sách Thế Giới Mới');

  showLoader();
  $dupSubmitBtn.prop('disabled', true).text('Sao chép...');
  try {
    const api = await getTavernHelper();
    const entries = await getLorebookEntries(source);

    await api.createLorebook(target);

    const newEntries = entries.map(e => {
      const newE = { ...e };
      delete newE.uid;
      return newE;
    });

    await api.replaceLorebookEntries(target, newEntries);

    toastr.success(`Sao chép thành công sách thế giới như "${target}"`);
    $dupTargetInput.val('');
  } catch (e) {
    toastr.error(`Sao chép không thành công: ${e.message}`);
  } finally {
    hideLoader();
    $dupSubmitBtn.prop('disabled', false).text('Xác nhận bản sao');
  }
}

export async function populateRenameSelect() {
  try {
    const books = await getAllLorebooks();
    $renameSourceSelect.empty().append('<option value="">--Hãy chọn sách thế giới để đổi tên--</option>');
    books.forEach(b => $renameSourceSelect.append(`<option value="${escapeHtml(b.file_name)}">${escapeHtml(b.name)}</option>`));
  } catch (e) {
    toastr.error('Không thể tải danh sách sách thế giới');
  }
}

export async function handleRenameWorldbook() {
  const source = $renameSourceSelect.val();
  const newName = $renameTargetInput.val().trim();
  if (!source) return toastr.warning('Hãy chọn sách thế giới để đổi tên');
  if (!newName) return toastr.warning('Vui lòng nhập tên mới');

  showLoader();
  $renameSubmitBtn.prop('disabled', true).text('Đổi tên...');
  try {
    const api = await getTavernHelper();
    const entries = await getLorebookEntries(source);
    await api.createLorebook(newName);
    const newEntries = entries.map(e => {
      const newE = { ...e };
      delete newE.uid;
      return newE;
    });
    await api.replaceLorebookEntries(newName, newEntries);
    await api.deleteLorebook(source);

    toastr.success(`Thành công sẽ "${source}" Đổi tên thành "${newName}"`);
    $renameTargetInput.val('');
    await populateRenameSelect();
  } catch (e) {
    toastr.error(`Đổi tên không thành công: ${e.message}`);
  } finally {
    hideLoader();
    $renameSubmitBtn.prop('disabled', false).text('Xác nhận thay đổi');
  }
}

export async function handleCreateWorldbook(callback) {
  const name = prompt('Vui lòng nhập tên Sách Thế Giới Mới：');
  if (!name || !name.trim()) return;
  try {
    const api = await getTavernHelper();
    await api.createLorebook(name.trim());
    toastr.success(`sách thế giới "${name}" Đã tạo thành công！`);
    if (callback) await callback(name.trim());
  } catch (e) {
    toastr.error(`Tạo không thành công: ${e.message}`);
  }
}
