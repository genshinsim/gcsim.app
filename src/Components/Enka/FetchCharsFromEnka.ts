import EnkaToGOOD from "./EnkaToGOOD";

interface EnkaResponse {
  playerInfo: any;
  avatarInfoList: any[];
}

export default async function FetchandValidateDataFromEnka(validUid: string) {
  const enkaResponse = await fetch(
    `https://enka.gcsim.workers.dev/${validUid}`
  );
  if (!enkaResponse.ok) {
    throw new Error(`Failed to fetch ${validUid}`);
  }

  const enkaData = await enkaResponse.json();
  const goodData = EnkaToGOOD(enkaData);
  console.log(goodData);
  return goodData;
}
