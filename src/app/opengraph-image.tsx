import { headers } from "next/headers";
import { ImageResponse } from "next/og";

export const alt = "Caminho Seguro — rede comunitária de proteção infantil";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const requestHeaders = await headers();

  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  const logoUrl = `${protocol}://${host}/CaminhoSeguroLogo.png`;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        overflow: "hidden",
        background: "linear-gradient(135deg, #071a2f 0%, #0d4164 50%, #11624f 100%)",
        color: "#ffffff",
        padding: "68px 76px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          border: "2px solid rgba(72, 213, 185, 0.16)",
          top: "-210px",
          right: "130px",
          display: "flex",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "310px",
          height: "310px",
          borderRadius: "50%",
          border: "2px solid rgba(77, 181, 255, 0.12)",
          bottom: "-190px",
          left: "390px",
          display: "flex",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "rgba(63, 207, 172, 0.07)",
          top: "76px",
          left: "560px",
          display: "flex",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "66%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "center",
            padding: "10px 18px",
            borderRadius: "999px",
            border: "1px solid rgba(142, 240, 214, 0.35)",
            background: "rgba(10, 42, 67, 0.4)",
            color: "#a7f3d0",
            fontSize: "19px",
            fontWeight: 700,
            letterSpacing: "0.4px",
            marginBottom: "28px",
          }}
        >
          Rede de proteção infantil
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "67px",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-2px",
            marginBottom: "25px",
          }}
        >
          Caminho Seguro
        </div>

        <div
          style={{
            display: "flex",
            maxWidth: "700px",
            fontSize: "30px",
            lineHeight: 1.35,
            color: "#d8f1fa",
            marginBottom: "32px",
          }}
        >
          Conectando famílias, escolas e comunidade por meio de tecnologia para ampliar a
          proteção infantil.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "13px",
            marginBottom: "39px",
          }}
        >
          {["QR Code", "Bluetooth", "Pontos seguros"].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "9px 15px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#c7f9e8",
                fontSize: "19px",
                fontWeight: 600,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "19px",
            color: "#b9cddd",
          }}
        >
          caminho-seguro.rcg-tech.com.br
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "31%",
          height: "390px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "330px",
            height: "330px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56, 189, 248, 0.19) 0%, rgba(34, 197, 94, 0.08) 48%, rgba(0, 0, 0, 0) 72%)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            width: "335px",
            height: "335px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "38px",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            background: "rgba(255, 255, 255, 0.07)",
            boxShadow: "0 28px 70px rgba(0, 0, 0, 0.22)",
          }}
        >
          <img
            src={logoUrl}
            alt=""
            width={320}
            height={320}
            style={{
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "76px",
          right: "76px",
          bottom: "35px",
          height: "2px",
          display: "flex",
          background:
            "linear-gradient(90deg, rgba(56, 189, 248, 0.6), rgba(74, 222, 128, 0.45), rgba(255, 255, 255, 0))",
        }}
      />
    </div>,
    size,
  );
}
