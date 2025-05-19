document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".sidebar li");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      contents.forEach(content => content.classList.remove("active"));
      const selected = document.getElementById(tab.dataset.tab);
      selected.classList.add("active");

      // 탭 클릭 시 데이터 로딩
      switch (tab.dataset.tab) {
        case "counseling":
          loadList("counseling", "/api/counseling", "상담기록이 없습니다.");
          break;
        case "selftest":
          loadList("selftest", "/api/selftest", "자가진단 내역이 없습니다.");
          break;
        case "emotion":
          loadEmotionGraph();
          break;
      }
    });
  });

  function loadList(containerId, url, emptyMessage) {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById(containerId);
        if (data.length === 0) {
          container.innerHTML = `<p>${emptyMessage}</p>`;
        }
        container.innerHTML = `
        <table border="1" cellpadding="8">
          <tr><th>제목</th><th>날짜</th><th>요약</th></tr>
          ${data.map((d, i) => `
            <tr class="clickable" onclick="showCounselingDetail(${i})">
              <td>${d.title}</td>
              <td>${d.date}</td>
              <td>${d.summary}</td>
            </tr>`).join('')}
        </table>
      `;
        window.counselingData = data;
      })
      .catch(() => {
        document.getElementById(containerId).innerHTML = `<p>데이터를 불러오는 중 오류가 발생했습니다.</p>`;
      });
  }
  function showCounselingDetail(index) {
    const counseling = window.counselingData[index];
    const container = document.getElementById('counseling');

    container.innerHTML = `
    <button onclick="loadList('counseling', '/api/counseling', '상담기록이 없습니다.')">← 상담 목록으로</button>
    <h2>${counseling.title}</h2>
    <p><strong>날짜:</strong> ${counseling.date}</p>
    <p><strong>상담 요약:</strong><br>${counseling.summary}</p>
    <p><strong>상세 내용:</strong><br>${counseling.detail}</p>
 
    `;
  }

  function loadEmotionGraph() {
    const container = document.getElementById('emotion');
    fetch('/api/emotion-graph')
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          container.innerHTML = `<p>감정 기록이 없습니다.</p>`;
          return;
        }

        container.innerHTML = `<canvas id="emotionChart" width="600" height="300"></canvas>`;
        const ctx = document.getElementById('emotionChart').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map(d => d.date),
            datasets: [{
              label: '감정 점수',
              data: data.map(d => d.score),
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              fill: true
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      })
      .catch(() => {
        container.innerHTML = `<p>감정 그래프를 불러오는 중 오류가 발생했습니다.</p>`;
      });
  }
});