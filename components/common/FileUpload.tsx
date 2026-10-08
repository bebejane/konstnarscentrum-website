import React, { useEffect, useState, useCallback } from 'react';
import { OnProgressInfo } from '@datocms/cma-client-browser';
import { buildClient } from '@datocms/cma-client-browser';
import { SimpleSchemaTypes } from '@datocms/cma-client';
import { MAX_ALLOWED_IMAGES, MIN_IMAGE_HEIGHT, MIN_IMAGE_WIDTH } from '/lib/constant';

const client = buildClient({
	apiToken: process.env.NEXT_PUBLIC_UPLOADS_API_TOKEN,
	environment: process.env.NEXT_PUBLIC_DATOCMS_ENVIRONMENT,
});

const parseImageFile = async (file: File): Promise<ImageData> => {
	if (!file) return Promise.reject('Invalid file');

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = (err) => reject(err);
		reader.onload = (e) => {
			const image = new Image();
			if (e.target.result === 'data:') return reject('invalid');
			image.src = e.target.result as string;
			image.onload = function () {
				resolve({ width: image.width, height: image.height, src: image.src });
			};
		};
		reader.readAsDataURL(file);
	});
};

export type ImageData = {
	width: number;
	height: number;
	src: string;
};

export type Props = {
	customData?: any;
	accept: string;
	sizeLimit?: number;
	tags?: string[];
	onDone: (upload: Upload) => void;
	onUploading: (uploading: boolean) => void;
	onImageData?: (image: ImageData) => void;
	onProgress: (percentage: number) => void;
	onError: (err: Error) => void;
	mediaLibrary: boolean;
};

export type Upload = SimpleSchemaTypes.Upload;

const FileUpload = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
	const {
		customData = {},
		tags,
		accept,
		sizeLimit,
		onDone,
		onUploading,
		onImageData,
		onProgress,
		mediaLibrary,
		onError,
	} = props;

	const [error, setError] = useState<Error | undefined>();
	const [allTags, setAllTags] = useState<string[]>(['upload']);
	const [upload, setUpload] = useState<Upload | undefined>();

	const resetInput = useCallback(() => {
		setUpload(undefined);
		onUploading(false);
		setError(undefined);
		ref.current.value = '';
	}, [setUpload, setError, ref, onUploading]);

	const fetchUserImages = async (): Promise<FileField[]> => {
		return new Promise(async (resolve, reject) => {
			try {
				const res = await fetch('/api/account/images', { method: 'GET' });
				if (res.status !== 200) reject(new Error('Det uppstod ett fel vid hämtning av bilder'));
				const { images } = await res.json();
				resolve(images);
			} catch (err) {
				reject(err);
			}
		});
	};

	const createUpload = useCallback(
		async (file: File, allTags): Promise<Upload> => {
			if (!file) return Promise.reject(new Error('Ingen fil vald'));

			if (mediaLibrary) {
				try {
					const images = await fetchUserImages();
					if (images.length > MAX_ALLOWED_IMAGES)
						return Promise.reject(
							new Error(`Det går max att ladda upp ${MAX_ALLOWED_IMAGES} antal bilder`),
						);
				} catch (err) {
					setError(err as Error);
					return;
				}
			}

			resetInput();
			onUploading(true);

			return new Promise((resolve, reject) => {
				client.uploads
					.createFromFileOrBlob({
						fileOrBlob: file,
						filename: file.name,
						tags: allTags,
						default_field_metadata: {
							en: {
								alt: '',
								title: '',
								custom_data: customData,
							},
						},
						onProgress: (info: OnProgressInfo) => {
							if (info.payload && 'progress' in info.payload) onProgress(info.payload.progress);
						},
					})
					.then(resolve)
					.catch(reject);
			});
		},
		[customData, onUploading, onProgress, resetInput, mediaLibrary],
	);

	const handleChange = useCallback(
		async (event) => {
			const file: File = event.target.files[0];
			if (!file) return;

			try {
				const fileMb = file.size / 1024 ** 2;

				if (sizeLimit && fileMb > sizeLimit)
					throw new Error(`Storleken på filen får ej vara större än ${sizeLimit}mb`);

				if (file.type.includes('image')) {
					let image: ImageData;
					try {
						image = await parseImageFile(file);
					} catch (err) {
						console.log('error getting image dimensions');
					}

					if (image) {
						if (image.width < MIN_IMAGE_WIDTH && image.height < MIN_IMAGE_HEIGHT)
							throw new Error(
								`Bildens upplösning är för låg. Bilder måste minst vara ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} pixlar.`,
							);
						if (image.width < MIN_IMAGE_WIDTH && image.width > image.height)
							throw new Error(
								`Bildens upplösning är för låg. Bilder måste  minst vara ${MIN_IMAGE_WIDTH} pixlar bred.`,
							);
						if (image.height < MIN_IMAGE_HEIGHT && image.height > image.width)
							throw new Error(
								`Bildens upplösning är för låg. Bilder måste minst vara ${MIN_IMAGE_HEIGHT} pixlar hög.`,
							);

						onImageData?.(image);
					}
				}

				const upload = await createUpload(file, allTags);
				onDone(upload);
			} catch (err) {
				setError(err);
			}
			onUploading(false);
		},
		[createUpload, onUploading, onDone, setError, onImageData, allTags, sizeLimit],
	);

	useEffect(() => {
		if (!ref.current) return;
		ref.current.addEventListener('change', handleChange);
		return () => ref.current?.removeEventListener('change', handleChange);
	}, [ref, handleChange]);

	useEffect(() => {
		upload && onDone(upload);
	}, [upload]);
	useEffect(() => {
		console.log(error);
		onError(error);
		ref.current.value = '';
	}, [error]);

	useEffect(() => {
		setAllTags((s) => (tags ? [...tags, 'upload'] : ['upload']));
	}, [tags]);

	return <input type='file' ref={ref} accept={accept} style={{ display: 'none' }} />;
});

FileUpload.displayName = 'FileUpload';
export default FileUpload;
