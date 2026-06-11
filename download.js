const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ==================== CẤU HÌNH Ở ĐÂY ====================
const domainTrangWeb = 'https://www.zettruyen.one';
const đườngDẫnMẫu = '/truyen-tranh/hoa-phung-lieu-nguyen/chuong-';

const chuongBatDau = 1;
const chuongKetThuc = 5;

const viTriAnhSelector = '.chapter-images-container img';
// ========================================================

function taoTenThuMuc(urlPath) {
  const cleanPath = urlPath.replace(/^\/|\/$/g, '');
  const parts = cleanPath.split(/[\/-]/);
  if (parts[0] === 'truyen' && parts[1] === 'tranh') parts.splice(0, 2);
  else if (parts[0] === 'truyen') parts.splice(0, 1);

  const formattedParts = parts.map((part) => {
    if (!part) return '';
    return part.charAt(0).toUpperCase() + part.slice(1);
  });
  return formattedParts.filter(Boolean).join('_');
}

function clearAndLog(text) {
  process.stdout.write(text + '\n');
}

(async () => {
  // Thêm flag ẩn danh và giảm tải việc tải không cần thiết để tăng tốc độ
  const browser = await chromium.launch({
    headless: false,
    args: ['--blink-settings=imagesEnabled=true'] // Đảm bảo luôn bật tải ảnh
  });

  console.log(`🎬 Bắt đầu tiến trình tải từ Chương ${chuongBatDau} đến Chương ${chuongKetThuc}...`);

  for (let chap = chuongBatDau; chap <= chuongKetThuc; chap++) {
    const duongDanHienTai = `${đườngDẫnMẫu}${chap}`;
    const urlFull = `${domainTrangWeb}${duongDanHienTai}`;

    const tenThuMuc = taoTenThuMuc(duongDanHienTai);
    const thuMucLuu = path.join(__dirname, tenThuMuc);

    // 🌟 TẠO CONTEXT MỚI TINH: Đánh lừa hệ thống chống bot, reset sạch IP/Session tạm thời
    const tinhChinhContext = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await tinhChinhContext.newPage();

    console.log(`\n--------------------------------------------------`);
    console.log(`📖 Đang xử lý: Chương ${chap}`);

    // Nghỉ từ 3 - 5 giây ngẫu nhiên giữa các chương để giả lập hành vi đọc của người thật
    const delayTime = Math.floor(Math.random() * 2000) + 3000;
    console.log(`⏳ Nghỉ giải lao ${delayTime / 1000} giây tránh bị chặn...`);
    await page.waitForTimeout(delayTime);

    console.log(`🔗 URL: ${urlFull}`);

    if (!fs.existsSync(thuMucLuu)) {
      fs.mkdirSync(thuMucLuu, { recursive: true });
    }

    try {
      // 🌟 FIX LỖI TIMEOUT: Thay đổi chiến lược đợi sang domcontentloaded
      console.log('🚀 Đang mở trang web...');
      await page.goto(urlFull, { waitUntil: 'domcontentloaded', timeout: 45000 });

      // 🌟 SỬA ĐỔI CHUẨN: Đợi cho đến khi ít nhất 3 ảnh ĐÃ TẢI XONG DỮ LIỆU THẬT lên màn hình
      console.log('⏳ Đợi ít nhất 3 ảnh đầu tiên hiện hình hoàn toàn (xong dữ liệu)...');
      try {
        await page.waitForFunction(
          (selector) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length < 3) return false;

            // Kiểm tra 3 phần tử đầu tiên xem đã "complete" (hiện hình) chưa
            let soAnhDaHienLen = 0;
            for (let i = 0; i < 3; i++) {
              const img = elements[i];
              // img.complete = true nghĩa là trình duyệt đã tải xong xuôi bức ảnh đó
              // img.naturalHeight > 0 để đảm bảo ảnh không bị lỗi hiển thị (ảnh vỡ)
              if (img.complete && img.naturalHeight > 0) {
                soAnhDaHienLen++;
              }
            }

            return soAnhDaHienLen >= 3; // Chỉ trả về true khi cả 3 ảnh đã hiện rõ ràng
          },
          viTriAnhSelector,
          { timeout: 30000 } // Tăng thời gian đợi lên 30 giây cho chắc chắn
        );
        console.log('✅ 3 ảnh đầu tiên đã hiện hình xong! Chuẩn bị kích hoạt cuộn...');
      } catch (timeoutError) {
        console.log('⚠️ Mạng chậm, quá 30s ảnh chưa hiện hết nhưng vẫn tiến hành cuộn để kích thích...');
      }

      // Cho nghỉ thêm 1 giây sau khi ảnh hiện rồi mới cuộn cho mượt
      await page.waitForTimeout(1000);

      console.log('🔄 Đang kích hoạt chế độ cuộn trang thông minh...');
      // 1. Ép cuộn trang bằng Javascript
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let lastHeight = document.body.scrollHeight;
          let totalScrolled = 0;

          const timer = setInterval(() => {
            window.scrollBy(0, 400); // Tăng tốc cuộn một chút
            totalScrolled += 400;
            const newHeight = document.body.scrollHeight;

            if (totalScrolled >= newHeight || (totalScrolled > lastHeight && newHeight === lastHeight)) {
              setTimeout(() => {
                if (document.body.scrollHeight === newHeight) {
                  clearInterval(timer);
                  resolve();
                }
              }, 600);
            }
            lastHeight = newHeight;
          }, 100);
        });
      });

      // 2. Giả lập bấm PageDown để kích hoạt lazy load triệt để
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(200);
      }

      // Thu thập link ảnh
      const imageSrcs = await page.$$eval(viTriAnhSelector, (imgs) =>
        imgs
          .map((img) => img.src || img.getAttribute('data-src') || img.getAttribute('data-original'))
          .filter(Boolean)
      );

      const tongSoAnh = imageSrcs.length;

      if (tongSoAnh === 0) {
        console.log(`⚠️ Không tìm thấy ảnh nào. Có thể sai Selector hoặc trang đổi cấu trúc.`);
        await page.close();
        await tinhChinhContext.close();
        continue;
      }

      console.log(`📸 Tìm thấy tổng cộng ${tongSoAnh} ảnh. Bắt đầu tiến trình tải...`);

      for (let i = 0; i < tongSoAnh; i++) {
        const imgUrl = imageSrcs[i];
        //await page.waitForTimeout(400); // Giãn cách tránh bị nghẽn mạng

        const soThuTuHienTai = (i + 1).toString().padStart(3, '0');
        const dinhDang = imgUrl.split('.').pop().split('?')[0] || 'jpg';
        const tenFile = `anh_${soThuTuHienTai}.${dinhDang}`;
        const duongDanFile = path.join(thuMucLuu, tenFile);

        process.stdout.write(`⏳ [${i + 1}/${tongSoAnh}] Đang tải ${tenFile}...`);

        try {
          // Thực hiện request tải ảnh trực tiếp từ context của chương hiện tại
          const response = await tinhChinhContext.request.get(imgUrl, {
            headers: {
              'Referer': urlFull,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
            timeout: 30000,
          });

          if (response.ok()) {
            const buffer = await response.body();
            fs.writeFileSync(duongDanFile, buffer);
            clearAndLog(` \x1b[32m✅ Thành công\x1b[0m`);
          } else {
            clearAndLog(` \x1b[31m❌ Thất bại (Status ${response.status()})\x1b[0m`);
          }
        } catch (err) {
          clearAndLog(` \x1b[31m❌ Lỗi: ${err.message}\x1b[0m`);
        }
      }

      console.log(`✅ Đã tải xong thành công Chương ${chap}!`);
    } catch (error) {
      console.error(`💥 Lỗi khi tải Chương ${chap}:`, error.message);
    } finally {
      // Dọn dẹp sạch sẽ bộ nhớ của chương cũ trước khi mở chương tiếp theo
      await page.close();
      await tinhChinhContext.close();
    }
  }

  console.log(`\n🎉 TẤT CẢ ĐÃ HOÀN THÀNH!`);
  await browser.close();
})();