'use client';
import {
  Carousel,
  CarouselContent,
  CarouselNavigation,
  CarouselIndicator,
  CarouselItem,
} from '@/components/motion-primitives/carousel';
import { DestinationCard } from '@/components/DestinationCard';
import type { DestinationSummary } from '@/components/DestinationCard';
import type { Destination } from '@/lib/types';

interface DestinationGridProps {
  destinations: Destination[];
  passportId: string;
  summaries: Map<string, DestinationSummary>;
}

export function DestinationGrid({ destinations, passportId, summaries }: DestinationGridProps) {
  return (
    <div className='dest-carousel-wrap'>
      <Carousel>
        <CarouselContent className='-ml-3 sm:-ml-4'>
          {destinations.map((dest) => (
            <CarouselItem
              key={dest.id}
              className='pl-3 sm:pl-4 basis-[88%] sm:basis-1/2 lg:basis-1/3'
            >
              <DestinationCard
                destination={dest}
                passportId={passportId}
                summary={summaries.get(dest.id)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselNavigation
          className='absolute -bottom-11 left-auto top-auto w-full justify-end gap-2 pr-1'
          classNameButton='bg-white border border-[var(--border)] shadow-sm text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors'
          alwaysShow
        />

        <CarouselIndicator className='bottom-[-2.75rem]' />
      </Carousel>
    </div>
  );
}
