import axios from 'axios'

async function main() {
  const { AGN_TOKEN: auth, SERVER_URL: url } = process.env
  const query = `mutation Update($auth: String!) { update(auth: $auth) }`
  const variables = { auth }

  const res = await axios
    .post(url, { query, variables })
    .then((res) => res.data)
    .catch((e) => e)

  if (!res || !res.update === 'OK') console.error(res)
  process.exit()
}

main()
