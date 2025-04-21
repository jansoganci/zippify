import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ListingResultPreviewProps {
  title: string;
  description: string;
  tags: string[];
  altTexts: string[];
}

export const ListingResultPreview: React.FC<ListingResultPreviewProps> = ({
  title,
  description,
  tags,
  altTexts,
}) => {
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 pb-4">
          <div className="text-xs text-muted-foreground mb-1">Başlık</div>
          <div className="text-lg font-semibold text-foreground break-words">{title || "-"}</div>
        </CardContent>
      </Card>

      {/* Açıklama */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 pb-4">
          <div className="text-xs text-muted-foreground mb-1">Açıklama</div>
          <div className="text-base text-foreground whitespace-pre-line break-words">{description || "-"}</div>
        </CardContent>
      </Card>

      {/* Anahtar Kelimeler */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 pb-4">
          <div className="text-xs text-muted-foreground mb-1">Anahtar Kelimeler</div>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(tags) && tags.length > 0 ? (
              tags.map((tag, i) => (
                <Badge key={i} className="bg-primary/10 text-primary font-normal">{tag}</Badge>
              ))
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alt Metinler */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 pb-4">
          <div className="text-xs text-muted-foreground mb-1">Alt Metinler</div>
          <ul className="list-disc pl-6 space-y-1">
            {Array.isArray(altTexts) && altTexts.length > 0 ? (
              altTexts.map((text, i) => (
                <li key={i} className="text-foreground text-sm">{text}</li>
              ))
            ) : (
              <li className="text-muted-foreground">-</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingResultPreview;
