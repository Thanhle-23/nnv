(() => {
  'use strict';

  // Dữ liệu đầy đủ đồng bộ với content-data.js
  const fallbackSearchData = [

    // =========================
    // 10 NGHỆ NHÂN
    // =========================
    {
      type: 'Nghệ nhân',
      title: 'Phan Thị Thuận – Nghệ nhân dệt lụa',
      description: 'Gìn giữ nghề dệt Phùng Xá và phát triển sản phẩm lụa từ tơ sen.',
      url: 'chi-tiet-nghe-nhan.html?id=1',
      image: '../images/artisans/phan-thi-thuan/portrait.webp',
      keywords: 'phan thị thuận phan thi thuan dệt lụa tơ sen phùng xá mỹ đức hà nội nghệ nhân'
    },
    {
      type: 'Nghệ nhân',
      title: 'Nguyễn Tấn Phát – Nghệ nhân sơn mài',
      description: 'Thực hành và giới thiệu nghệ thuật sơn mài tại làng cổ Đường Lâm.',
      url: 'chi-tiet-nghe-nhan.html?id=2',
      image: '../images/artisans/nguyen-tan-phat/portrait.webp',
      keywords: 'nguyễn tấn phát nguyen tan phat sơn mài đường lâm sơn tây hà nội nghệ nhân'
    },
    {
      type: 'Nghệ nhân',
      title: 'Nguyễn Thị Oanh – Nghệ nhân tranh Đông Hồ',
      description: 'Gìn giữ kỹ thuật làm tranh dân gian Đông Hồ và các giá trị văn hóa Kinh Bắc.',
      url: 'chi-tiet-nghe-nhan.html?id=3',
      image: '../images/artisans/nguyen-thi-oanh/portrait.webp',
      keywords: 'nguyễn thị oanh nguyen thi oanh tranh đông hồ thuận thành bắc ninh nghệ nhân tranh dân gian'
    },
    {
      type: 'Nghệ nhân',
      title: 'Huỳnh Sướng – Nghệ nhân mộc Kim Bồng',
      description: 'Gắn bó với nghề mộc và chạm khắc gỗ truyền thống tại làng Kim Bồng.',
      url: 'chi-tiet-nghe-nhan.html?id=4',
      image: '../images/artisans/huynh-suong/portrait.webp',
      keywords: 'huỳnh sướng huynh suong mộc kim bồng chạm khắc gỗ hội an đà nẵng quảng nam nghệ nhân'
    },
    {
      type: 'Nghệ nhân',
      title: 'Nguyễn Hóa – Nghệ nhân hoa giấy Thanh Tiên',
      description: 'Gìn giữ nghề làm hoa giấy truyền thống gắn với đời sống văn hóa Huế.',
      url: 'chi-tiet-nghe-nhan.html?id=5',
      image: '../images/artisans/nguyen-hoa/portrait.webp',
      keywords: 'nguyễn hóa nguyen hoa hoa giấy thanh tiên phú vinh huế nghệ nhân nghề truyền thống'
    },
    {
      type: 'Nghệ nhân',
      title: 'Đàng Thị Mỹ Trâm – Nghệ nhân chạm bạc Chăm',
      description: 'Tiếp nối nghề chạm bạc truyền thống gắn với văn hóa và đời sống cộng đồng Chăm.',
      url: 'chi-tiet-nghe-nhan.html?id=6',
      image: '../images/artisans/dang-thi-my-tram/portrait.webp',
      keywords: 'đàng thị mỹ trâm dang thi my tram chạm bạc chăm bàu trúc ninh phước khánh hòa ninh thuận nghệ nhân'
    },
    {
      type: 'Nghệ nhân',
      title: 'Mohamad – Nghệ nhân dệt thổ cẩm Chăm',
      description: 'Gìn giữ nghề dệt thổ cẩm và kết nối nghề truyền thống với du lịch cộng đồng Châu Phong.',
      url: 'chi-tiet-nghe-nhan.html?id=7',
      image: '../images/artisans/mohamad/portrait.webp',
      keywords: 'mohamad dệt thổ cẩm chăm châu phong tân châu an giang nghệ nhân du lịch cộng đồng'
    },
    {
      type: 'Nghệ nhân',
      title: 'Lâm Phên – Nghệ nhân chế tác mặt nạ Khmer',
      description: 'Chế tác, phục chế mão, mặt nạ và hiện vật gắn với văn hóa Khmer Nam Bộ.',
      url: 'chi-tiet-nghe-nhan.html?id=8',
      image: '../images/artisans/lam-phen/portrait.webp',
      keywords: 'lâm phên lam phen mặt nạ khmer mão khmer nghệ nhân song lộc vĩnh long trà vinh văn hóa khmer'
    },
    {
      type: 'Nghệ nhân',
      title: 'Triệu Thị Vui – Nghệ nhân tranh kiếng Khmer',
      description: 'Gìn giữ kỹ thuật vẽ ngược trên kính của dòng tranh kiếng Khmer truyền thống.',
      url: 'chi-tiet-nghe-nhan.html?id=9',
      image: '../images/artisans/trieu-thi-vui/portrait.webp',
      keywords: 'triệu thị vui trieu thi vui tranh kiếng khmer tranh kính thuận hòa phước thuận cần thơ sóc trăng nghệ nhân'
    },
    {
      type: 'Nghệ nhân',
      title: 'Trương Thị Bạch Thủy – Nghệ nhân mây tre đan',
      description: 'Gìn giữ và phát triển nghề đan đát Khmer từ tre, trúc và vật liệu tự nhiên.',
      url: 'chi-tiet-nghe-nhan.html?id=10',
      image: '../images/artisans/truong-thi-bach-thuy/portrait.webp',
      keywords: 'trương thị bạch thủy truong thi bach thuy mây tre đan đan lát khmer thuận hòa cần thơ sóc trăng nghệ nhân'
    },

    // =========================
    // 10 SẢN PHẨM
    // =========================
    {
      type: 'Sản phẩm',
      title: 'Khăn dệt từ tơ sen',
      description: 'Sản phẩm dệt thủ công từ những sợi tơ rút trực tiếp từ cuống sen tại Phùng Xá, Hà Nội.',
      url: 'chi-tiet-san-pham.html?id=1',
      image: '../images/products/khan-to-sen/cover.webp',
      keywords: 'khăn dệt từ tơ sen khăn tơ sen dệt lụa phùng xá hà nội phan thị thuận sản phẩm'
    },
    {
      type: 'Sản phẩm',
      title: 'Tượng trâu sơn mài',
      description: 'Tác phẩm sơn mài trên gỗ mít và đá ong của Nghệ nhân Ưu tú Nguyễn Tấn Phát tại Đường Lâm.',
      url: 'chi-tiet-san-pham.html?id=2',
      image: '../images/products/tuong-trau-son-mai/cover.webp',
      keywords: 'tượng trâu sơn mài gỗ mít đá ong đường lâm hà nội nguyễn tấn phát sản phẩm'
    },
    {
      type: 'Sản phẩm',
      title: 'Tranh dân gian Đông Hồ',
      description: 'Dòng tranh khắc gỗ trên giấy dó phủ điệp với màu tự nhiên tại Thuận Thành, Bắc Ninh.',
      url: 'chi-tiet-san-pham.html?id=3',
      image: '../images/products/tranh-dong-ho/cover.webp',
      keywords: 'tranh dân gian đông hồ giấy dó điệp ván khắc gỗ bắc ninh nguyễn thị oanh sản phẩm'
    },
    {
      type: 'Sản phẩm',
      title: 'Tác phẩm mộc Cội nguồn',
      description: 'Tác phẩm chạm khắc gỗ mỹ nghệ gắn với Nghệ nhân Ưu tú Huỳnh Sướng tại làng mộc Kim Bồng.',
      url: 'chi-tiet-san-pham.html?id=4',
      image: '../images/products/coi-nguon-huynh-suong/cover.webp',
      keywords: 'tác phẩm mộc cội nguồn mộc mỹ nghệ kim bồng hội an đà nẵng huỳnh sướng sản phẩm'
    },
    {
      type: 'Sản phẩm',
      title: 'Hoa sen giấy Thanh Tiên',
      description: 'Sản phẩm hoa sen giấy thủ công truyền thống của gia đình nghệ nhân Nguyễn Hóa tại Huế.',
      url: 'chi-tiet-san-pham.html?id=5',
      image: '../images/products/hoa-sen-giay-thanh-tien/cover.webp',
      keywords: 'hoa sen giấy thanh tiên hoa giấy huế nguyễn hóa sản phẩm'
    },
    {
      type: 'Sản phẩm',
      title: 'Khay trầu chạm bạc Chăm',
      description: 'Vật dụng nghi lễ chạm khắc hoa văn truyền thống của gia đình Nghệ nhân Đàng Thị Mỹ Trâm.',
      url: 'chi-tiet-san-pham.html?id=6',
      image: '../images/products/khay-trau-cham/cover.webp',
      keywords: 'khay trầu chạm bạc chăm bàu trúc ninh phước khánh hòa đàng thị mỹ trâm sản phẩm'
    },
    {
      type: 'Sản phẩm',
      title: 'Xà rông thổ cẩm Chăm',
      description: 'Sản phẩm dệt thổ cẩm truyền thống với hoa văn đặc trưng của cộng đồng Chăm Châu Phong.',
      url: 'chi-tiet-san-pham.html?id=7',
      image: '../images/products/xa-rong-cham/cover.webp',
      keywords: 'xà rông thổ cẩm chăm dệt thổ cẩm châu phong an giang mohamad sản phẩm'
    },
    {
      type: 'Sản phẩm',
      title: 'Mặt nạ Khmer truyền thống',
      description: 'Mặt nạ thủ công gắn với sân khấu và văn hóa Khmer Nam Bộ do Nghệ nhân Lâm Phên chế tác.',
      url: 'chi-tiet-san-pham.html?id=8',
      image: '../images/products/mat-na-khmer/cover.webp',
      keywords: 'mặt nạ khmer truyền thống mão khmer song lộc vĩnh long lâm phên sản phẩm'
    },
    {
      type: 'Sản phẩm',
      title: 'Tranh kiếng Khmer chủ đề Phật giáo Nam Tông',
      description: 'Dòng tranh vẽ ngược trên kính được Nghệ nhân Triệu Thị Vui gìn giữ tại làng Phước Thuận.',
      url: 'chi-tiet-san-pham.html?id=9',
      image: '../images/products/tranh-kieng-khmer/cover.webp',
      keywords: 'tranh kiếng khmer vẽ ngược trên kính phật giáo nam tông cần thơ triệu thị vui sản phẩm'
    },
    {
      type: 'Sản phẩm',
      title: 'Bộ dụng cụ bắt cá truyền thống',
      description: 'Nhóm sản phẩm đan đát truyền thống đạt OCOP của Hợp tác xã Mây tre đan Thủy Tuyết.',
      url: 'chi-tiet-san-pham.html?id=10',
      image: '../images/products/bo-dung-cu-bat-ca/cover.webp',
      keywords: 'bộ dụng cụ bắt cá truyền thống mây tre đan khmer cần thơ trương thị bạch thủy sản phẩm'
    },

    // =========================
    // 4 CÂU CHUYỆN VĂN HÓA
    // =========================
    {
      type: 'Câu chuyện',
      title: 'Từ cuống sen đến sợi tơ Phùng Xá',
      description: 'Câu chuyện về nghệ nhân Phan Thị Thuận, nghề dệt Phùng Xá và hành trình tạo nên lụa từ tơ sen.',
      url: 'chi-tiet-cau-chuyen.html?id=1',
      image: '../images/artisans/phan-thi-thuan/portrait.webp',
      keywords: 'từ cuống sen đến sợi tơ phùng xá dệt lụa hà nội phan thị thuận câu chuyện văn hóa'
    },
    {
      type: 'Câu chuyện',
      title: 'Sơn mài chậm giữa nhịp sống nhanh',
      description: 'Câu chuyện về nghệ nhân Nguyễn Tấn Phát và cách sơn mài truyền thống đến gần hơn với người trẻ.',
      url: 'chi-tiet-cau-chuyen.html?id=2',
      image: '../images/artisans/nguyen-tan-phat/portrait.webp',
      keywords: 'sơn mài chậm giữa nhịp sống nhanh nguyễn tấn phát đường lâm hà nội câu chuyện văn hóa'
    },
    {
      type: 'Câu chuyện',
      title: 'Giữ sắc màu tranh Đông Hồ qua nhiều thế hệ',
      description: 'Câu chuyện về nghề làm tranh dân gian Đông Hồ, kỹ thuật in ván khắc gỗ và người giữ nghề.',
      url: 'chi-tiet-cau-chuyen.html?id=3',
      image: '../images/artisans/nguyen-thi-oanh/portrait.webp',
      keywords: 'giữ sắc màu tranh đông hồ qua nhiều thế hệ bắc ninh nguyễn thị oanh câu chuyện văn hóa'
    },
    {
      type: 'Câu chuyện',
      title: 'Giữ hồn mộc Kim Bồng bên dòng Thu Bồn',
      description: 'Câu chuyện về Nghệ nhân Ưu tú Huỳnh Sướng và hành trình nối dài nghề mộc Kim Bồng.',
      url: 'chi-tiet-cau-chuyen.html?id=4',
      image: '../images/artisans/huynh-suong/portrait.webp',
      keywords: 'giữ hồn mộc kim bồng bên dòng thu bồn huỳnh sướng hội an đà nẵng câu chuyện văn hóa'
    },

    // =========================
    // 10 TRẢI NGHIỆM
    // =========================
    {
      type: 'Trải nghiệm',
      title: 'Trải nghiệm dệt lụa và làm sợi tơ sen ở Phùng Xá',
      description: 'Tìm hiểu quy trình dệt lụa Phùng Xá, thử thao tác dệt tơ tằm và làm sợi tơ sen.',
      url: 'chi-tiet-trai-nghiem.html?id=1',
      image: '../images/artisans/phan-thi-thuan/portrait.webp',
      keywords: 'trải nghiệm dệt lụa tơ sen phùng xá mỹ đức hà nội phan thị thuận'
    },
    {
      type: 'Trải nghiệm',
      title: 'Trải nghiệm tranh in khắc gỗ và sơn mài tại Đường Lâm',
      description: 'Gặp nghệ nhân Nguyễn Tấn Phát, tìm hiểu mỹ thuật truyền thống và thực hành tại Đường Lâm.',
      url: 'chi-tiet-trai-nghiem.html?id=2',
      image: '../images/artisans/nguyen-tan-phat/portrait.webp',
      keywords: 'trải nghiệm tranh in khắc gỗ sơn mài đường lâm sơn tây hà nội nguyễn tấn phát'
    },
    {
      type: 'Trải nghiệm',
      title: 'Trải nghiệm in tranh dân gian Đông Hồ',
      description: 'Tìm hiểu giấy điệp, màu tự nhiên, ván khắc và thử in tranh dân gian Đông Hồ tại Bắc Ninh.',
      url: 'chi-tiet-trai-nghiem.html?id=3',
      image: '../images/artisans/nguyen-thi-oanh/portrait.webp',
      keywords: 'trải nghiệm in tranh dân gian đông hồ thuận thành bắc ninh nguyễn thị oanh'
    },
    {
      type: 'Trải nghiệm',
      title: 'Khám phá hành trình từ cuống sen đến sợi tơ sen',
      description: 'Tìm hiểu cách nghệ nhân xử lý cuống sen, kéo sợi tơ mảnh và chuẩn bị nguyên liệu dệt.',
      url: 'chi-tiet-trai-nghiem.html?id=4',
      image: '../images/artisans/phan-thi-thuan/portrait.webp',
      keywords: 'khám phá hành trình từ cuống sen đến sợi tơ sen phùng xá hà nội trải nghiệm'
    },
    {
      type: 'Trải nghiệm',
      title: 'Thử dệt một mẫu lụa nhỏ trên khung cửi Phùng Xá',
      description: 'Làm quen với khung cửi, tìm hiểu cách sắp xếp sợi và thử thực hiện thao tác dệt cơ bản.',
      url: 'chi-tiet-trai-nghiem.html?id=5',
      image: '../images/artisans/phan-thi-thuan/portrait.webp',
      keywords: 'thử dệt một mẫu lụa nhỏ trên khung cửi phùng xá hà nội trải nghiệm'
    },
    {
      type: 'Trải nghiệm',
      title: 'Một buổi tìm hiểu nghề lụa cùng nghệ nhân Phan Thị Thuận',
      description: 'Gặp gỡ nghệ nhân, nghe câu chuyện về nghề dệt Phùng Xá và sự khác biệt giữa tơ tằm với tơ sen.',
      url: 'chi-tiet-trai-nghiem.html?id=6',
      image: '../images/artisans/phan-thi-thuan/portrait.webp',
      keywords: 'tìm hiểu nghề lụa cùng nghệ nhân phan thị thuận phùng xá hà nội trải nghiệm'
    },
    {
      type: 'Trải nghiệm',
      title: 'Thực hành in tranh khắc gỗ tại Đường Lâm',
      description: 'Quan sát bản khắc, tìm hiểu nguyên lý in thủ công và tự thực hiện một bản in đơn giản.',
      url: 'chi-tiet-trai-nghiem.html?id=7',
      image: '../images/artisans/nguyen-tan-phat/portrait.webp',
      keywords: 'thực hành in tranh khắc gỗ tại đường lâm sơn tây hà nội nguyễn tấn phát trải nghiệm'
    },
    {
      type: 'Trải nghiệm',
      title: 'Khám phá màu sắc và bề mặt trong nghệ thuật sơn mài',
      description: 'Tìm hiểu các lớp màu, chất liệu và cách tạo hiệu ứng bề mặt trong sản phẩm sơn mài.',
      url: 'chi-tiet-trai-nghiem.html?id=8',
      image: '../images/artisans/nguyen-tan-phat/portrait.webp',
      keywords: 'khám phá màu sắc bề mặt nghệ thuật sơn mài đường lâm nguyễn tấn phát trải nghiệm'
    },
    {
      type: 'Trải nghiệm',
      title: 'Khám phá màu tự nhiên trong tranh dân gian Đông Hồ',
      description: 'Tìm hiểu giấy điệp và các màu sắc truyền thống tạo nên bức tranh Đông Hồ.',
      url: 'chi-tiet-trai-nghiem.html?id=9',
      image: '../images/artisans/nguyen-thi-oanh/portrait.webp',
      keywords: 'khám phá màu tự nhiên tranh dân gian đông hồ bắc ninh nguyễn thị oanh trải nghiệm'
    },
    {
      type: 'Trải nghiệm',
      title: 'Từ ván khắc đến bức tranh Đông Hồ hoàn chỉnh',
      description: 'Theo dõi hành trình hình thành bức tranh Đông Hồ từ bản khắc, giấy điệp đến bản in hoàn chỉnh.',
      url: 'chi-tiet-trai-nghiem.html?id=10',
      image: '../images/artisans/nguyen-thi-oanh/portrait.webp',
      keywords: 'từ ván khắc đến bức tranh đông hồ hoàn chỉnh bắc ninh nguyễn thị oanh trải nghiệm'
    }
  ];

  function getActiveSearchData() {
    const data = window.NepVietData;
    if (!data) return fallbackSearchData;

    const items = [];

    if (Array.isArray(data.artists)) {
      data.artists.forEach(a => {
        items.push({
          type: 'Nghệ nhân',
          title: `${a.name} – ${a.craft}`,
          description: a.description || '',
          url: `chi-tiet-nghe-nhan.html?id=${encodeURIComponent(a.id)}`,
          image: a.image || '../images/minh-hoa-chung.svg',
          keywords: `${a.name} ${a.craft} ${a.place} ${a.province || ''} nghệ nhân`
        });
      });
    }

    if (Array.isArray(data.products)) {
      data.products.forEach(p => {
        items.push({
          type: 'Sản phẩm',
          title: p.name,
          description: p.description || '',
          url: `chi-tiet-san-pham.html?id=${encodeURIComponent(p.id)}`,
          image: p.image || '../images/minh-hoa-chung.svg',
          keywords: `${p.name} ${p.shortName || ''} ${p.craft} ${p.place} ${p.material || ''} sản phẩm`
        });
      });
    }

    if (Array.isArray(data.stories)) {
      data.stories.forEach(s => {
        items.push({
          type: 'Câu chuyện',
          title: s.title,
          description: s.description || '',
          url: `chi-tiet-cau-chuyen.html?id=${encodeURIComponent(s.id)}`,
          image: s.image || '../images/minh-hoa-chung.svg',
          keywords: `${s.title} ${s.shortTitle || ''} ${s.category || ''} câu chuyện văn hóa`
        });
      });
    }

    if (Array.isArray(data.experiences)) {
      data.experiences.forEach(e => {
        items.push({
          type: 'Trải nghiệm',
          title: e.title,
          description: e.summary || '',
          url: `chi-tiet-trai-nghiem.html?id=${encodeURIComponent(e.id)}`,
          image: e.image || '../images/minh-hoa-chung.svg',
          keywords: `${e.title} ${e.shortTitle || ''} ${e.place || ''} ${e.duration || ''} trải nghiệm`
        });
      });
    }

    return items.length ? items : fallbackSearchData;
  }

  // Gõ không dấu vẫn tìm được tiếng Việt có dấu.
  function normalizeText(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function installSearchImageFallback(scope) {
    if (!scope) return;
    scope.querySelectorAll('img').forEach(img => {
      if (img.dataset.fallbackReady) return;
      img.dataset.fallbackReady = '1';
      img.addEventListener('error', () => {
        if (img.dataset.fallbackUsed) return;
        img.dataset.fallbackUsed = '1';
        img.src = '../images/minh-hoa-chung.svg';
      });
    });
  }

  // BỘ LỌC TRANG TRẢI NGHIỆM (giống setupArtistFilters của trang Nghệ nhân)
  function setupExperienceFilters() {
    const grid = document.getElementById('experience-grid');
    const search = document.getElementById('experience-search');
    const craft = document.getElementById('experience-craft');
    const province = document.getElementById('experience-place');
    const empty = document.getElementById('experience-empty');

    if (!grid || !search || !craft || !province) return;
    if (grid.dataset.filterBound === '1') return;

    const cards = Array.from(grid.querySelectorAll('.experience-card'));
    if (!cards.length) return;

    grid.dataset.filterBound = '1';

    const data = window.NepVietData || {};
    const experiences = Array.isArray(data.experiences) ? data.experiences : [];
    const artists = Array.isArray(data.artists) ? data.artists : [];

    cards.forEach((el, index) => {
      const exp = experiences[index] || {};
      const artist = artists.find(a => Number(a.id) === Number(exp.artistId)) || {};

      el.dataset.name = `${exp.title || ''} ${artist.name || ''}`;
      el.dataset.craft = artist.craft || '';
      el.dataset.place = exp.place || '';
      el.dataset.province = artist.province || exp.place || '';
    });

    function applyFilters() {
      const q = normalizeText(search.value);
      const c = normalizeText(craft.value);
      const p = normalizeText(province.value);

      let count = 0;

      cards.forEach(el => {
        const searchable = normalizeText(`
          ${el.dataset.name || ''}
          ${el.dataset.craft || ''}
          ${el.dataset.place || ''}
          ${el.dataset.province || ''}
          ${el.textContent || ''}
        `);

        const matches =
          (!q || searchable.includes(q)) &&
          (!c || normalizeText(el.dataset.craft) === c) &&
          (!p || normalizeText(el.dataset.province).includes(p) || normalizeText(el.dataset.place).includes(p));

        el.hidden = !matches;
        el.style.display = matches ? '' : 'none';

        if (matches) {
          count += 1;
        }
      });

      if (empty) {
        empty.hidden = count !== 0;
      }
    }

    search.addEventListener('input', applyFilters);
    search.addEventListener('search', applyFilters);
    craft.addEventListener('change', applyFilters);
    province.addEventListener('change', applyFilters);

    applyFilters();
  }

  function setupSiteSearch() {
    const results = document.getElementById('search-results');
    if (!results) return;

    const params = new URLSearchParams(window.location.search);
    const input = document.getElementById('search-query');
    const summary = document.getElementById('search-summary');
    const empty = document.getElementById('search-empty');
    const form = document.getElementById('search-form');
    const originalQuery = params.get('q') || '';
    const query = normalizeText(originalQuery);
    let selectedType = 'all';

    if (input) input.value = originalQuery;
    if (form && input) {
      form.addEventListener('submit', event => {
        if (!input.value.trim()) {
          event.preventDefault();
          input.focus();
        }
      });
    }

    function renderResults() {
      const currentData = getActiveSearchData();
      const matches = currentData.filter(item => {
        return (selectedType === 'all' || item.type === selectedType)
          && (!query || normalizeText(`${item.title} ${item.description} ${item.keywords}`).includes(query));
      });

      results.innerHTML = matches.map(item => `
        <article class="content-card search-result-card reveal is-visible">
          <a class="content-card-image" href="${item.url}">
            <img src="${item.image}" alt="" loading="lazy">
          </a>
          <div class="content-card-body">
            <span class="search-result-type">${item.type}</span>
            <h2><a href="${item.url}">${item.title}</a></h2>
            <p>${item.description}</p>
            <a class="card-link" href="${item.url}">Xem chi tiết <span>↗</span></a>
          </div>
        </article>`).join('');

      installSearchImageFallback(results);

      if (summary) {
        summary.textContent = query
          ? `Kết quả cho “${originalQuery}” · ${matches.length} mục`
          : `Một số nội dung bạn có thể khám phá · ${matches.length} mục`;
      }
      if (empty) empty.hidden = matches.length > 0;
    }

    document.querySelectorAll('[data-search-filter]').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-search-filter]').forEach(other => other.classList.remove('active'));
        button.classList.add('active');
        selectedType = button.dataset.searchFilter || 'all';
        renderResults();
      });
    });
    renderResults();
  }

  // POPUP GỢI Ý: gắn vào ô tìm kiếm header đã có, KHÔNG TẠO Ô MỚI.
  function setupQuickSuggestions() {
    const forms = document.querySelectorAll('.site-header .header-search');
    forms.forEach(form => {
      const host = form.parentElement;
      const input = form.querySelector('input[name="q"]');
      if (!input || !host) return;

      let panel = host.querySelector('.search-suggest-panel');
      if (!panel) {
        panel = document.createElement('div');
        panel.className = 'search-suggest-panel';
        panel.id = `${input.id || 'header-q'}-suggestions`;
        panel.setAttribute('role', 'listbox');
        panel.setAttribute('aria-label', 'Gợi ý tìm kiếm');
        panel.hidden = true;
        host.appendChild(panel);
      }
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-controls', panel.id);
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('autocomplete', 'off');

      let links = [];
      let activeIndex = -1;

      function closePanel() {
        panel.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        activeIndex = -1;
      }

      function setActive(index) {
        activeIndex = index;
        links.forEach((link, i) => {
          link.classList.toggle('is-active', i === index);
          link.setAttribute('aria-selected', String(i === index));
        });
        if (index >= 0 && links[index]) {
          input.setAttribute('aria-activedescendant', links[index].id);
          links[index].scrollIntoView({ block: 'nearest' });
        } else {
          input.removeAttribute('aria-activedescendant');
        }
      }

      function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
      }

      function renderSuggestions() {
        const query = normalizeText(input.value);
        panel.replaceChildren();
        links = [];
        activeIndex = -1;

        if (!query) {
          closePanel();
          return;
        }

        const currentData = getActiveSearchData();
        const matches = currentData
          .filter(item => normalizeText(`${item.title} ${item.description} ${item.keywords}`).includes(query))
          .sort((a, b) => {
            const rank = item => normalizeText(item.title).startsWith(query) ? 0
              : normalizeText(item.keywords).startsWith(query) ? 1 : 2;
            return rank(a) - rank(b);
          })
          .slice(0, 6);

        panel.appendChild(element('div', 'search-suggest-heading', 'Gợi ý phù hợp'));
        if (!matches.length) {
          panel.appendChild(element('div', 'search-suggest-empty', 'Không tìm thấy nội dung phù hợp.'));
        } else {
          matches.forEach((item, index) => {
            const link = element('a', 'search-suggest-item');
            link.href = item.url;
            link.id = `${panel.id}-result-${index}`;
            link.setAttribute('role', 'option');
            link.setAttribute('aria-selected', 'false');
            link.setAttribute('data-type', item.type);
            link.tabIndex = -1;
            const symbol = item.type === 'Nghệ nhân' ? 'NN'
              : item.type === 'Sản phẩm' ? 'SP'
              : item.type === 'Câu chuyện' ? 'CC' : 'TN';
            link.appendChild(element('span', 'search-suggest-icon', symbol));
            const content = element('span', 'search-suggest-body');
            content.appendChild(element('span', 'search-suggest-type', item.type));
            content.appendChild(element('strong', 'search-suggest-title', item.title));
            content.appendChild(element('span', 'search-suggest-desc', item.description));
            link.appendChild(content);
            link.appendChild(element('span', 'search-suggest-arrow', '↗'));
            link.addEventListener('pointerenter', () => setActive(index));
            panel.appendChild(link);
            links.push(link);
          });
        }

        const all = element('a', 'search-suggest-footer', 'Xem tất cả kết quả →');
        all.href = `tim-kiem.html?q=${encodeURIComponent(input.value.trim())}`;
        panel.appendChild(all);
        panel.hidden = false;
        input.setAttribute('aria-expanded', 'true');
      }

      input.addEventListener('input', renderSuggestions);
      input.addEventListener('focus', () => {
        if (input.value.trim()) renderSuggestions();
      });
      input.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          closePanel();
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          if (panel.hidden) renderSuggestions();
          if (!links.length) return;
          event.preventDefault();
          const next = event.key === 'ArrowDown'
            ? (activeIndex + 1) % links.length
            : (activeIndex - 1 + links.length) % links.length;
          setActive(next);
        } else if (event.key === 'Enter' && !panel.hidden && activeIndex >= 0) {
          event.preventDefault();
          window.location.assign(links[activeIndex].href);
        }
      });
      form.addEventListener('submit', () => closePanel());
      host.addEventListener('focusout', () => {
        setTimeout(() => {
          if (!host.contains(document.activeElement)) closePanel();
        }, 0);
      });
      document.addEventListener('pointerdown', event => {
        if (!host.contains(event.target)) closePanel();
      });
    });
  }

  function init() {
    setupSiteSearch();
    setupQuickSuggestions();
    setupExperienceFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
    window.addEventListener('DOMContentLoaded', setupExperienceFilters, { once: true });
    setTimeout(setupExperienceFilters, 0);
  }
})();