import React             from 'react';

const revision          = require('../../../../revision.json');

const Version = () => (
    <pre>
        {JSON.stringify(revision, null, '\t')}
    </pre>
);


export default Version;
