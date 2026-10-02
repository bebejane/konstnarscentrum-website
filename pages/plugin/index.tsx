import dynamic from 'next/dynamic';

const PluginBootstrap = dynamic(() => import('/lib/plugin/PluginBootstrap'), { ssr: false });

export default function PluginPage() {
	return <PluginBootstrap />;
}
