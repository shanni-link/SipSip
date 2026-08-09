import { Routes, Route } from 'react-router-dom';
import { Step1Photo } from './new-record/Step1Photo';
import { Step4Info } from './new-record/Step4Info';
import { Step6Preview } from './new-record/Step6Preview';

export function NewRecordPage() {
  return (
    <Routes>
      <Route path="photo" element={<Step1Photo />} />
      <Route path="info" element={<Step4Info />} />
      <Route path="preview" element={<Step6Preview />} />
      <Route path="" element={<Step1Photo />} />
    </Routes>
  );
}
