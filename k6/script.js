import { check, sleep } from 'k6'
import http from 'k6/http'

export let options = {
  stages: Array.from({ length: 60 }).flatMap(() => [
    { duration: '15s', target: 20 },
    { duration: '45s', target: 5 },
  ]),
}

export default function () {
  const rand = max => Math.floor(Math.random() * max)

  const service_a_sleep_time = rand(1000)
  const service_b_sleep_time = rand(1000)
  const service_c_sleep_time = rand(1000)

  const url = `http://nginx?service_a_sleep_time=${service_a_sleep_time}&service_b_sleep_time=${service_b_sleep_time}&service_c_sleep_time=${service_c_sleep_time}`

  let res = http.get(url)
  check(res, { 'status was 200': (r) => r.status == 200 })

  sleep(1)
}