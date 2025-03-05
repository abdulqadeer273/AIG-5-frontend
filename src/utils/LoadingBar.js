import React, { useState } from 'react'
import LoadingBar from 'react-top-loading-bar'

const App = () => {
    const [progress, setProgress] = useState()

    return (
        <div>
            <LoadingBar
                color='#f11946'
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
        </div>
    )
}

export default App;