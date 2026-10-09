import demoData from '../_data/demos.json' with { type: 'json' };

/** One page per demo. Everything on it comes from the JSON the Node build produced. */
export default function* () {
    for (const demo of demoData.demos) {
        yield {
            url: `/demos/${demo.slug}/`,
            layout: 'layouts/demo.vto',
            title: demo.title,
            description: demo.description,
            demo,
        };
    }
}
