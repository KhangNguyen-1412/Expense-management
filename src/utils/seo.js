// SEO Metadata & Friendly URL Mapping

export const VIEW_URL_MAP = {
  dashboard: {
    slug: "/tong-quan",
    title: "Tổng quan | LifeHub - Trợ lý Sống & Tài chính",
    description: "Theo dõi số dư tài khoản, thu nhập và chi tiêu cá nhân hàng tháng trực quan và thông minh.",
  },
  statistics: {
    slug: "/bao-cao",
    title: "Báo cáo & Thống kê | LifeHub - Trợ lý Sống & Tài chính",
    description: "Phân tích xu hướng chi tiêu hàng ngày, biểu đồ tỷ trọng danh mục và xếp hạng chi tiêu khoa học.",
  },
  budget: {
    slug: "/ngan-sach",
    title: "Quản lý Ngân sách | LifeHub - Trợ lý Sống & Tài chính",
    description: "Thiết lập và kiểm soát hạn mức chi tiêu hàng tháng theo từng danh mục giúp tiết kiệm hiệu quả.",
  },
  goals: {
    slug: "/muc-tieu",
    title: "Mục tiêu Tiết kiệm | LifeHub - Trợ lý Sống & Tài chính",
    description: "Lập kế hoạch và theo dõi tiến độ hoàn thành các mục tiêu tài chính cá nhân ngắn hạn và dài hạn.",
  },
  history: {
    slug: "/lich-su",
    title: "Lịch sử Giao dịch | LifeHub - Trợ lý Sống & Tài chính",
    description: "Tra cứu, tìm kiếm, lọc theo ngày và xuất nhập dữ liệu giao dịch thu chi cá nhân nhanh chóng.",
  },
  add: {
    slug: "/them-moi",
    title: "Thêm Giao dịch | LifeHub - Trợ lý Sống & Tài chính",
    description: "Ghi chép giao dịch thu chi hàng ngày dễ dàng bằng tay hoặc bằng giọng nói trợ lý AI.",
  },
  calculator: {
    slug: "/tinh-luong-thue",
    title: "Tính Lương Net & Thuế | LifeHub - Trợ lý Sống & Tài chính",
    description: "Công cụ tính toán lương Net thực nhận sau Thuế TNCN 7 bậc, BHXH/BHYT/BHTN và chi phí điện nước phòng trọ.",
  },
  settings: {
    slug: "/cai-dat",
    title: "Cài đặt Hệ thống | LifeHub - Trợ lý Sống & Tài chính",
    description: "Tùy chỉnh giao diện tối, cài đặt mã PIN bảo mật, thông báo đẩy và giọng nói trợ lý AI.",
  },
  profile: {
    slug: "/trang-ca-nhan",
    title: "Trang cá nhân & Hồ sơ | LifeHub - Trợ lý Sống & Tài chính",
    description: "Xem thông tin tài khoản cá nhân, trạng thái đồng bộ Google Cloud và tổng quan tài chính.",
  },
  feed: {
    slug: "/nhat-ky-anh",
    title: "Nhật ký Ảnh Kỷ niệm | LifeHub - Trợ lý Sống & Tài chính",
    description: "Lưu giữ nhật ký khoảnh khắc, hình ảnh và bài viết kết nối với kho Google Drive cá nhân.",
  },
  landing: {
    slug: "/trang-gioi-thieu",
    title: "LifeHub - Trang Giới Thiệu & Nhật Ký Ảnh Polaroid | Nguyễn Huỳnh Phúc Khang",
    description: "Trang giới thiệu cá nhân thể hiện khoảnh khắc nhật ký ảnh và tổng quan thông tin cá nhân LifeHub.",
  },
};

// Map slug to viewId
export const SLUG_VIEW_MAP = Object.entries(VIEW_URL_MAP).reduce((acc, [viewId, meta]) => {
  acc[meta.slug] = viewId;
  return acc;
}, {});

// Normalize path to viewId
export const getViewFromPath = (path) => {
  const cleanPath = path.replace(/\/$/, "");
  if (!cleanPath || cleanPath === "" || cleanPath === "/") {
    return "landing";
  }
  return SLUG_VIEW_MAP[cleanPath] || "landing";
};

// Update Document Head SEO Meta Tags dynamically
export const updateSEOMeta = (viewId) => {
  const meta = VIEW_URL_MAP[viewId] || VIEW_URL_MAP.landing;

  // Title
  document.title = meta.title;

  // Meta Description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement("meta");
    descMeta.setAttribute("name", "description");
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute("content", meta.description);

  // Open Graph Title & Description
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", meta.title);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", meta.description);

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute("content", window.location.href);

  // Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.origin + meta.slug);
};
