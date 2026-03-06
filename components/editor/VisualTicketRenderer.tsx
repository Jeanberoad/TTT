"use client";

import { TicketTemplate, TicketElement } from "@/lib/editor-types";

interface TicketData {
  username: string;
  password?: string;
  profile: string;
  limit_uptime?: string;
  qr_url?: string;
}

interface VisualTicketRendererProps {
  template: TicketTemplate;
  ticket: TicketData;
  qrUrl: string;
  scale?: number;
}

export function VisualTicketRenderer({
  template,
  ticket,
  qrUrl,
  scale = 1,
}: VisualTicketRendererProps) {
  // Get display content for dynamic elements
  const getContent = (element: TicketElement): string => {
    switch (element.type) {
      case "username":
        return ticket.username || "Username";
      case "password":
        return ticket.password || "Password";
      case "duration":
        return ticket.limit_uptime || "1 month";
      case "profile":
        return ticket.profile || "Standard";
      case "url":
        return qrUrl.replace(/^https?:\/\/api\.qrserver\.com.*data=/, "").slice(0, 40) || "wifi.local/login";
      default:
        return element.content || element.placeholder || "";
    }
  };

  // Render background based on template settings
  const renderBackground = () => {
    const bg = template.background;
    const styles: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      borderRadius: `${template.dimensions.borderRadius}px`,
      overflow: "hidden",
    };

    if (bg.type === "solid") {
      return <div style={{ ...styles, backgroundColor: bg.color }} />;
    }

    if (bg.type === "gradient") {
      return (
        <div
          style={{
            ...styles,
            background: `linear-gradient(${bg.gradientAngle || 135}deg, ${bg.gradientFrom}, ${bg.gradientTo})`,
          }}
        />
      );
    }

    if (bg.type === "image" && bg.imageUrl) {
      return (
        <>
          <div
            style={{
              ...styles,
              backgroundImage: `url(${bg.imageUrl})`,
              backgroundSize: bg.imageFit,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: bg.imageOpacity,
            }}
          />
          {bg.overlayColor && (
            <div
              style={{
                ...styles,
                backgroundColor: bg.overlayColor,
                opacity: bg.overlayOpacity || 0.3,
              }}
            />
          )}
        </>
      );
    }

    return <div style={{ ...styles, backgroundColor: bg.color }} />;
  };

  // Render pattern overlay
  const renderPattern = () => {
    const bg = template.background;
    if (!bg.pattern || bg.pattern === "none") return null;

    const opacity = bg.patternOpacity || 0.1;
    const patternId = `pattern-${template.id}-${Date.now()}`;

    if (bg.pattern === "waves") {
      return (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity,
            borderRadius: `${template.dimensions.borderRadius}px`,
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id={`${patternId}-waves`}
              x="0"
              y="0"
              width="100"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 10 Q 25 0, 50 10 T 100 10"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#${patternId}-waves)`} />
        </svg>
      );
    }

    if (bg.pattern === "dots") {
      return (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity,
            borderRadius: `${template.dimensions.borderRadius}px`,
          }}
        >
          <defs>
            <pattern
              id={`${patternId}-dots`}
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="1" fill="#ffffff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId}-dots)`} />
        </svg>
      );
    }

    if (bg.pattern === "grid") {
      return (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity,
            borderRadius: `${template.dimensions.borderRadius}px`,
          }}
        >
          <defs>
            <pattern
              id={`${patternId}-grid`}
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId}-grid)`} />
        </svg>
      );
    }

    return null;
  };

  // Render a single element
  const renderElement = (element: TicketElement) => {
    if (!element.visible) return null;

    const textStyle = element.textStyle || {};
    const boxStyle = element.boxStyle;

    const textStyles: React.CSSProperties = {
      fontSize: `${(textStyle.fontSize || 14) * scale}px`,
      fontWeight: textStyle.fontWeight || "normal",
      fontStyle: textStyle.fontStyle || "normal",
      textAlign: textStyle.textAlign || "left",
      color: textStyle.color || "#ffffff",
      opacity: textStyle.opacity ?? 1,
      textTransform: textStyle.textTransform || "none",
      letterSpacing: textStyle.letterSpacing
        ? `${textStyle.letterSpacing}px`
        : undefined,
      fontFamily:
        textStyle.fontFamily === "serif"
          ? "Georgia, serif"
          : textStyle.fontFamily === "mono"
          ? "monospace"
          : "inherit",
      lineHeight: 1.2,
    };

    const containerStyles: React.CSSProperties = boxStyle
      ? {
          backgroundColor: `${boxStyle.backgroundColor}${Math.round(
            (boxStyle.backgroundOpacity || 1) * 255
          )
            .toString(16)
            .padStart(2, "0")}`,
          borderRadius: `${boxStyle.borderRadius || 0}px`,
          borderWidth: `${boxStyle.borderWidth || 0}px`,
          borderStyle: boxStyle.borderWidth ? "solid" : "none",
          borderColor: `${boxStyle.borderColor}${Math.round(
            (boxStyle.borderOpacity || 1) * 255
          )
            .toString(16)
            .padStart(2, "0")}`,
          padding: `${(boxStyle.padding || 0) * scale}px`,
          backdropFilter: boxStyle.blur ? `blur(${boxStyle.blur}px)` : undefined,
        }
      : {};

    const elementContainerStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.position.x}%`,
      top: `${element.position.y}%`,
      width: `${element.size.width}%`,
      height: `${element.size.height}%`,
      zIndex: element.zIndex,
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    };

    // QR Code element
    if (element.type === "qrcode") {
      return (
        <div key={element.id} style={elementContainerStyle}>
          <div
            style={{
              ...containerStyles,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="QR Code"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              crossOrigin="anonymous"
            />
          </div>
        </div>
      );
    }

    // Divider element
    if (element.type === "divider") {
      return (
        <div key={element.id} style={elementContainerStyle}>
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: boxStyle?.backgroundColor || "#ffffff",
              opacity: boxStyle?.backgroundOpacity || 0.3,
            }}
          />
        </div>
      );
    }

    // Badge element
    if (element.type === "badge") {
      return (
        <div key={element.id} style={elementContainerStyle}>
          <div
            style={{
              ...containerStyles,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={textStyles}>{getContent(element)}</span>
          </div>
        </div>
      );
    }

    // Username, Password, Duration, Profile elements (with labels)
    if (
      element.type === "username" ||
      element.type === "password" ||
      element.type === "duration" ||
      element.type === "profile"
    ) {
      return (
        <div key={element.id} style={elementContainerStyle}>
          <div
            style={{
              ...containerStyles,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {element.showLabel && element.label && (
              <span
                style={{
                  fontSize: `${Math.max(8, (textStyle.fontSize || 14) * 0.4) * scale}px`,
                  color: textStyle.color || "#ffffff",
                  opacity: 0.6,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: `${2 * scale}px`,
                }}
              >
                {element.label}
              </span>
            )}
            <span style={textStyles}>{getContent(element)}</span>
          </div>
        </div>
      );
    }

    // Default text element
    return (
      <div key={element.id} style={elementContainerStyle}>
        <div
          style={{
            ...containerStyles,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <span style={textStyles}>{getContent(element)}</span>
        </div>
      </div>
    );
  };

  // Calculate pixel dimensions based on mm and a conversion factor
  const mmToPx = 3.78 * scale; // approx 3.78 px per mm
  const width = template.dimensions.width * mmToPx;
  const height = template.dimensions.height * mmToPx;

  return (
    <div
      className="visual-ticket"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        borderRadius: `${template.dimensions.borderRadius}px`,
        borderWidth: `${template.dimensions.borderWidth}px`,
        borderStyle: "solid",
        borderColor: `${template.dimensions.borderColor}${Math.round(
          (template.dimensions.borderOpacity || 1) * 255
        )
          .toString(16)
          .padStart(2, "0")}`,
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background */}
      {renderBackground()}

      {/* Pattern overlay */}
      {renderPattern()}

      {/* Elements */}
      {template.elements
        .filter((el) => el.visible)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((element) => renderElement(element))}
    </div>
  );
}
