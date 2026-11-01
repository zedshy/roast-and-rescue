type AppIconArtworkProps = {
  pixels: number;
};

export function AppIconArtwork({ pixels }: AppIconArtworkProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "22%",
        background: "#090909",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "58%",
          height: "58%",
          left: "-24%",
          top: "-22%",
          display: "flex",
          borderRadius: "50%",
          background: "#fb4903",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "42%",
          height: "42%",
          right: "-20%",
          bottom: "-16%",
          display: "flex",
          borderRadius: "50%",
          background: "#55db9c",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: pixels * 0.34,
          fontWeight: 900,
          letterSpacing: pixels * -0.035,
          lineHeight: 1,
        }}
      >
        <span>R</span>
        <span style={{ color: "#fb4903", fontSize: pixels * 0.25 }}>&amp;</span>
        <span>R</span>
      </div>
      <div
        style={{
          position: "absolute",
          right: "12%",
          top: "10%",
          width: "17%",
          height: "17%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotate(45deg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "22%",
            height: "100%",
            display: "flex",
            borderRadius: pixels,
            background: "#ffd731",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "22%",
            display: "flex",
            borderRadius: pixels,
            background: "#ffd731",
          }}
        />
      </div>
    </div>
  );
}
