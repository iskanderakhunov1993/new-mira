"use client";

import { useState } from "react";
import { Check, HeartPulse, MoonStar, Plus, ShieldAlert, SunMedium } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function UiKitShadcnShowcase() {
  const [state, setState] = useState(["energy"]);

  return (
    <div className="uik-component-board uik-shadcn-board">
      <Card>
        <CardHeader>
          <CardTitle>Кнопки и статусы</CardTitle>
          <CardDescription>Primary используется только для главного действия.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button size="lg"><Check data-icon="inline-end" />Сохранить отметки</Button>
          <Button size="lg" variant="secondary">Посмотреть историю</Button>
          <Button size="lg" variant="ghost"><Plus data-icon="inline-start" />Добавить заметку</Button>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Badge>Сохранено</Badge>
          <Badge variant="secondary">Наблюдение</Badge>
          <Badge variant="outline">Мало данных</Badge>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые отметки</CardTitle>
          <CardDescription>ToggleGroup сохраняет понятное multi-select поведение.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ToggleGroup
            multiple
            value={state}
            onValueChange={setState}
            variant="outline"
            spacing={2}
            aria-label="Выберите состояние"
          >
            <ToggleGroupItem value="pain" aria-label="Боль"><HeartPulse />Боль</ToggleGroupItem>
            <ToggleGroupItem value="energy" aria-label="Энергия"><SunMedium />Энергия</ToggleGroupItem>
            <ToggleGroupItem value="sleep" aria-label="Сон"><MoonStar />Сон</ToggleGroupItem>
          </ToggleGroup>
          <Separator />
          <label className="flex flex-col gap-2 text-sm font-medium">
            Заметка
            <Input placeholder="Как вы себя чувствуете?" />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Обратная связь</CardTitle>
          <CardDescription>Alert сообщает состояние, не изображая диагноз.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Alert>
            <HeartPulse />
            <AlertTitle>Mira заметила</AlertTitle>
            <AlertDescription>Энергия ниже обычного по трём отметкам за последние семь дней.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <ShieldAlert />
            <AlertTitle>Нужна медицинская помощь</AlertTitle>
            <AlertDescription>Если боль сильная или необычная, обратитесь к врачу.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Пустое состояние</CardTitle>
          <CardDescription>Объясняет, чего не хватает и что добавить дальше.</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><HeartPulse /></EmptyMedia>
              <EmptyTitle>Пока мало данных</EmptyTitle>
              <EmptyDescription>Отмечайте состояние ещё 3–5 дней, чтобы увидеть первые повторения.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    </div>
  );
}
