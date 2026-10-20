"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { unoptimized } from "../../media";
import { Tx, useBloom } from "../BloomContext";
import { Reveal } from "../Reveal";
import { Heading, Section } from "./Heading";

export function LocationSection({ mapUrl, mapImage, location }: { mapUrl: string; mapImage: string; location: string }) {
  const { t } = useBloom();
  const [qr, setQr] = useState("");

  useEffect(() => {
    if (!mapUrl) return;
    QRCode.toDataURL(mapUrl, { width: 320, margin: 1, color: { dark: "#43652F", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [mapUrl]);

  return (
    <Section id="location">
      <Heading title={t.location} />
      {location && (
        <Reveal variant="fadeUpSm">
          <p className="mb-5 text-center text-sm leading-[1.9] text-[var(--green)]">
            <Tx>{location}</Tx>
          </p>
        </Reveal>
      )}
      {mapImage && (
        <Reveal variant="scaleIn" className="bloom-card overflow-hidden p-2">
          <Image
            src={mapImage}
            alt={t.location}
            unoptimized={unoptimized(mapImage)}
            width={960}
            height={720}
            sizes="(max-width: 512px) 100vw, 512px"
            className="h-auto w-full rounded-2xl object-cover"
          />
        </Reveal>
      )}
      {mapUrl && (
        <div className="mt-6 flex flex-col items-center gap-5">
          {qr && (
            <Reveal variant="popIn" className="bloom-card p-3">
              <img src={qr} alt="Google Maps QR" width={128} height={128} className="h-32 w-32" />
            </Reveal>
          )}
          <Reveal variant="fadeUp" delay={0.1}>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="bloom-pill inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold">
              <MapPin size={16} /> <Tx>{t.openMap}</Tx>
            </a>
          </Reveal>
        </div>
      )}
    </Section>
  );
}
