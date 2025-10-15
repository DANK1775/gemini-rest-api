const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');

const baseSpec = require('../config/swagger');

function extractSwaggerBlocks(fileContent) {
	const regex = /\/\*\*[\s\S]*?@swagger([\s\S]*?)\*\//g;
	const blocks = [];
	let match;
	while ((match = regex.exec(fileContent)) !== null) {
		const raw = match[1];
		// remove leading * and whitespace
		const cleaned = raw.split('\n').map(l => l.replace(/^\s*\*\s?/, '')).join('\n');
		blocks.push(cleaned);
	}
	return blocks;
}

function mergeSpecs(base, additions) {
	const result = JSON.parse(JSON.stringify(base));
	additions.forEach(add => {
		// merge paths
		if (add.paths) {
			result.paths = result.paths || {};
			Object.assign(result.paths, add.paths);
		}
		// merge components
		if (add.components) {
			result.components = result.components || {};
			Object.keys(add.components).forEach(k => {
				result.components[k] = Object.assign(result.components[k] || {}, add.components[k]);
			});
		}
		// merge tags
		if (add.tags) {
			result.tags = result.tags || [];
			result.tags = result.tags.concat(add.tags.filter(t => !result.tags.find(r => r.name === t.name)));
		}
	});
	return result;
}

async function main() {
	const routeFiles = glob.sync(path.join(process.cwd(), 'src', 'routes', '*.js'));
	const additions = [];

	for (const file of routeFiles) {
		const content = fs.readFileSync(file, 'utf8');
		const blocks = extractSwaggerBlocks(content);
		for (const block of blocks) {
			try {
				const doc = yaml.load(block);
				if (doc) additions.push(doc);
			} catch (err) {
				console.error(`Failed to parse @swagger block in ${file}:`, err.message);
			}
		}
	}

	const merged = mergeSpecs(baseSpec, additions);

	const outputPath = path.resolve(process.cwd(), 'public', 'swagger.json');
	fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf8');
	console.log('✅ Swagger JSON generated at', outputPath);
}

main().catch(err => {
	console.error('Error generating swagger.json:', err);
	process.exit(1);
});
