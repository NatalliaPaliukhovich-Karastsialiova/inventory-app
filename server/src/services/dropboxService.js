import axios from "axios";

const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

function assertDropbox() {
  if (!DROPBOX_ACCESS_TOKEN) {
    const err = new Error("Missing Dropbox access token");
    err.code = "INTEGRATION_DROPBOX_MISCONFIGURED";
    throw err;
  }
}

export async function uploadJsonToDropbox(path, data) {
  assertDropbox();
  const content = Buffer.from(JSON.stringify(data, null, 2), "utf-8");

  const { status, data: resp } = await axios.post(
    "https://content.dropboxapi.com/2/files/upload",
    content,
    {
      headers: {
        Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path,
          mode: { ".tag": "add" },
          autorename: true,
          mute: false,
          strict_conflict: false
        })
      }
    }
  );

  if (status !== 200) {
    const err = new Error("Dropbox upload failed");
    err.code = "INTEGRATION_DROPBOX_UPLOAD_FAILED";
    throw err;
  }
  return resp;
}


