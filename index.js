jQuery(async () => {
  try {
    await import('./src/main.js');
  } catch (e) {
    console.error('[đồng bộ hóa sách thế giới] Tải mô-đun không thành công:', e);
  }
});
