import { Client } from 'sdk';

async function main() {
  const idToken = process.env.ID_TOKEN;
  const accessToken = process.env.ACCESS_TOKEN;

  const client = new Client(idToken, accessToken);

  await client.authenticate();

  const data = await client.request('GET', '/portfolio');

  console.log(data);
}

main();