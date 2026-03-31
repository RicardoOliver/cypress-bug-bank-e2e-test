import http from 'k6/http';

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '30s', target: 200 },
    { duration: '30s', target: 20 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.03'],
    http_req_duration: ['p(95)<1500']
  }
};

export default function () {
  http.get(`${baseUrl}/health`);
}
