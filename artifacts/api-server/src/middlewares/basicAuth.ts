import { type Request, type Response, type NextFunction } from "express";

const ADMIN_USER = "admin";
const ADMIN_PASS = "4848";

export function basicAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization ?? "";

  if (!authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Hotspot Admin"');
    res.status(401).send("Authentification requise");
    return;
  }

  const encoded = authHeader.slice("Basic ".length);
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const colonIdx = decoded.indexOf(":");
  const user = decoded.slice(0, colonIdx);
  const pass = decoded.slice(colonIdx + 1);

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Hotspot Admin"');
    res.status(401).send("Identifiants invalides");
    return;
  }

  next();
}
