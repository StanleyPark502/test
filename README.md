# PC 부품 가격 현황 대시보드

주요 PC 부품의 가격 동향을 한눈에 확인할 수 있는 대시보드.

## 포함 부품

| 카테고리 | 제조사/필터 | 주요 제품 |
|----------|-----------|----------|
| **GPU** | NVIDIA / AMD | RTX 5090~5060, 40시리즈, 30시리즈, RX 9070/7900/7800 |
| **CPU** | Intel / AMD | Arrow Lake Refresh, Core 14세대, Ryzen 9000/7000 |
| **RAM** | DDR5 | 16GB, 32GB, 64GB, 96GB 키트 |
| **SSD** | NVMe | 1TB, 2TB, 4TB |
| **HDD** | - | 2TB, 4TB, 8TB |

## 기능

- **기간 선택**: 1년 / 2년 / 3년 / 5년
- **제조사별 필터**: GPU(NVIDIA/AMD), CPU(Intel/AMD)
- **가격 차트**: Chart.js 인터랙티브 라인 차트
- **요약 카드**: 현재가, MSRP 대비, 기간 변동률
- **월별 상세 테이블**
- **시장 동향 노트**: 카테고리별 최신 시장 상황 안내

## 데이터 출처 (2026년 3월 기준)

- Tom's Hardware GPU/RAM/SSD Price Tracking 2026
- TechSpot GPU Pricing Q1 2026
- TrendForce DRAM/NAND 시세
- Gartner 메모리 시장 전망
- VideoCardz, WCCFTech CPU 가격 추적

## 주요 시장 현황 (2026년 3월)

- **RAM**: DDR5 가격 300% 폭등. AI HBM 수요가 일반 DRAM 공급 잠식. 정상화 2027년 이후 전망
- **SSD**: NAND 가격 246% 상승. Crucial 소비자 사업 철수. 정상화 2027~2028 전망
- **GPU**: RTX 5090 MSRP 대비 40~75% 프리미엄. 5060/5070은 MSRP 근처
- **HDD**: 평균 46% 상승. AI 데이터센터 수요 + 공급망 차질

## 사용

`public/pc-parts-price.html` 파일을 브라우저에서 열면 됩니다.
GitHub Pages 배포 시 별도 서버 없이 접속 가능합니다.
