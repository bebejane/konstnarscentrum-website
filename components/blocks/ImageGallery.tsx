import s from './ImageGallery.module.scss';
import cn from 'classnames';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Swiper as SwiperReact, SwiperSlide } from 'swiper/react';
import type { Swiper } from 'swiper';
import { KCImage as Image } from '/components';
import { DatoMarkdown as Markdown } from 'dato-nextjs-utils/components';
import { useWindowSize } from 'rooks';

export type ImageGalleryBlockProps = { id: string; images: FileField[]; onClick?: Function; editable?: boolean };

export default function ImageGallery({ id, images, onClick, editable = false }: ImageGalleryBlockProps) {
	const swiperRef = useRef<Swiper | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [index, setIndex] = useState(0);
	const [arrowMarginTop, setArrowMarginTop] = useState(0);
	const { innerHeight, innerWidth } = useWindowSize();
	const [captionHeight, setCaptionHeight] = useState<number | undefined>();

	const calculatePositions = useCallback(() => {
		Array.from(containerRef.current.querySelectorAll<HTMLImageElement>('picture>img')).forEach((img) => {
			setArrowMarginTop((state) => (img.clientHeight / 2 > state ? img.clientHeight / 2 : state));
		});

		let figcaptionHeight = 0;

		Array.from(containerRef.current.querySelectorAll<HTMLDivElement>('figure>figcaption')).forEach((caption) => {
			caption.style.minHeight = '0px';
			figcaptionHeight =
				caption.clientHeight > figcaptionHeight || !figcaptionHeight ? caption.clientHeight : figcaptionHeight;
			caption.style.minHeight = `${figcaptionHeight}px`;
		});
	}, [setArrowMarginTop]);

	useEffect(() => {
		calculatePositions();
	}, [innerHeight, innerWidth, calculatePositions]);

	return (
		<div className={s.gallery} data-editable={editable} ref={containerRef}>
			<div className={s.fade}></div>
			<SwiperReact
				id={`${id}-swiper-wrap`}
				className={s.swiper}
				loop={true}
				noSwiping={false}
				simulateTouch={true}
				slidesPerView='auto'
				initialSlide={index}
				onSlideChange={({ realIndex }) => setIndex(realIndex)}
				onSwiper={(swiper) => (swiperRef.current = swiper)}
			>
				{images.map((item, idx) => (
					<SwiperSlide key={`${idx}-${captionHeight}`} className={cn(s.slide)}>
						<figure id={`${id}-${item.id}`} onClick={() => onClick?.(item.id)}>
							<Image
								data={item.responsiveImage}
								className={s.image}
								pictureClassName={s.picture}
								placeholderClassName={s.picture}
								objectFit={'cover'}
								onLoad={calculatePositions}
								intersectionMargin='0px 0px 200% 0px'
							/>
							<figcaption>{item.title && <Markdown allowedElements={['em', 'p']}>{item.title}</Markdown>}</figcaption>
						</figure>
					</SwiperSlide>
				))}
			</SwiperReact>
			{images.length > 3 && (
				<div
					className={s.next}
					style={{ top: `${arrowMarginTop}px`, display: arrowMarginTop ? 'flex' : 'none' }}
					onClick={() => swiperRef.current?.slideNext()}
				>
					→
				</div>
			)}
		</div>
	);
}
