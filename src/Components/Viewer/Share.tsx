import {
  Button,
  ButtonGroup,
  Callout,
  Checkbox,
  FormGroup,
  InputGroup,
  Position,
  Spinner,
  SpinnerSize,
  Toaster,
} from "@blueprintjs/core";
import axios, { AxiosRequestHeaders } from "axios";
import pako from "pako";
import React from "react";
import { bytesToBase64 } from "./base64";
import { SimResults } from "./DataType";
import { Trans, useTranslation } from "react-i18next";

export interface ShareProps {
  // isOpen: boolean;
  // handleClose: () => void;
  data: SimResults;
}

const disabled = false;

const ak = "api-key";

export const AppToaster = Toaster.create({
  position: Position.BOTTOM_RIGHT,
});

export default function Share(props: ShareProps) {
  let { t } = useTranslation();

  const [loading, setIsLoading] = React.useState<boolean>(false);
  const [errMsg, setErrMsg] = React.useState<string>("");
  const [url, setURL] = React.useState<string>("");
  const [isPerm, setIsPerm] = React.useState<boolean>(false);
  const [perm, setPerm] = React.useState<boolean>(false);
  const [apiKey, setAPIKey] = React.useState<string>("");
  const [viewPass, setViewPass] = React.useState<boolean>(false);

  React.useEffect(() => {
    let key = localStorage.getItem(ak);
    if (key !== null && key !== "") {
      setAPIKey(key);
    }
  }, []);

  const handleUpload = () => {
    //encode data
    let compressed = pako.deflate(JSON.stringify(props.data));

    // const restored = JSON.parse(pako.inflate(compressed, { to: "string" }));

    // console.log(restored);

    let s = bytesToBase64(compressed);

    // console.log(s);
    //"{\"author\":\"anon\",\"description\":\"none\",\"data\":\"stuff\"}"
    setIsLoading(true);
    setIsPerm(false);
    setURL("");
    let h: AxiosRequestHeaders = {
      "Access-Control-Allow-Origin": "*",
    };

    if (perm) {
      h[ak] = apiKey;
    }

    axios({
      method: "post",
      url: "https://viewer.gcsim.workers.dev/upload",
      headers: h,
      data: {
        author: "anon",
        description: "none",
        data: s,
      },
    })
      .then((response) => {
        console.log(response);
        if (response.data.id) {
          setErrMsg("");
          setURL(response.data.id);
          setIsPerm(response.data.perm);
          setIsLoading(false);
        } else {
          setErrMsg(t("viewer.upload_failed"));
          setURL("");
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setErrMsg(t("viewer.error_encountered") + error);
        setURL("");
        setIsLoading(false);
      });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://gcsim.app/viewer/share/${url}`).then(
      () => {
        AppToaster.show({
          message: t("viewer.copied_to_clipboard"),
          intent: "success",
        });
      },
      () => {
        AppToaster.show({
          message: t("viewer.error_copying_not"),
          intent: "danger",
        });
      }
    );
  };

  return (
    <div className="wide:w-[70rem] ml-auto mr-auto bg-gray-600 rounded-md p-4 flex flex-col gap-2">
      <div>
        <div className="font-bold text-lg mb-2">
          <Trans>viewer.create_a_shareable</Trans>
        </div>
        <div>
          <Trans>viewer.note_that_by</Trans>
        </div>
      </div>
      <div className="flex flex-col place-items-center">
        <FormGroup label={t("viewer.make_link_permanent")} inline>
          <Checkbox checked={perm} onClick={() => setPerm(!perm)} />
        </FormGroup>
        <FormGroup label={t("viewer.api_key_supporters")} inline>
          <InputGroup
            type={viewPass ? "text" : "password"}
            value={apiKey}
            onChange={(v) => {
              const val = v.target.value;
              setAPIKey(val);
              localStorage.setItem(ak, val);
            }}
            rightElement={
              <Button
                icon={viewPass ? "unlock" : "lock"}
                intent="warning"
                onClick={() => setViewPass(!viewPass)}
              />
            }
          />
        </FormGroup>
      </div>
      <div>
        <Trans>viewer.please_note_that</Trans>
      </div>
      <ButtonGroup fill className="mb-4">
        <Button
          intent="primary"
          onClick={handleUpload}
          disabled={loading || disabled}
        >
          <Trans>viewer.upload</Trans>
        </Button>
      </ButtonGroup>
      {loading ? <Spinner size={SpinnerSize.LARGE} /> : null}
      {errMsg === "" ? (
        url !== "" ? (
          <Callout intent="success">
            <div className="flex flex-col gap-2 place-items-center">
              <span className="text-lg">
                <Trans>viewer.link_pre</Trans>
                {isPerm
                  ? t("viewer.link_is_permanent")
                  : t("viewer.link_will_expire")}
                <Trans>viewer.link_post</Trans>
              </span>
              <div className="p-2 rounded-md bg-green-700">
                <pre>{`https://gcsim.app/viewer/share/${url}`}</pre>
              </div>
              <Button
                intent="success"
                onClick={handleCopy}
                disabled={url === ""}
              >
                <Trans>viewer.copy_link</Trans>
              </Button>
            </div>
          </Callout>
        ) : null
      ) : (
        <Callout intent="warning">{errMsg}</Callout>
      )}
    </div>
  );
}
