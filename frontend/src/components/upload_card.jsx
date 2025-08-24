import { Button } from 'primereact/button';
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext';

const UploadCard = () => {
    return (
        <Card title="Simple Card">
            <div className="card flex justify-content-center flex-col">
                <div className="flex flex-column flex-col gap-2">
                    <label htmlFor="github-link">Github URL</label>
                    <InputText id="github-link" aria-describedby="github-link" />
                    <small id="github-link-help">
                        Enter the full URL of your public GitHub repository.
                    </small>
                </div>
                <Button label="Submit" />
            </div>

        </Card>
    )
}

export default UploadCard