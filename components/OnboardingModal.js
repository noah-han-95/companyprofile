function OnboardingModal({ onComplete, onSkip, slides }) {
  const [step, setStep] = useState('upload'); // upload | loading | done
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleFileAndGenerate = async (f) => {
    if (!f) return;
    setFile(f);
    setError('');

    try {
      setProgress('파일에서 텍스트를 추출하는 중...');
      const text = await extractTextFromFile(f);
      setProgress('AI가 문서를 분석하고 슬라이드를 생성하는 중...');
      setStep('loading');
      const newSlides = await mapContentToSlides(slides, text);
      setStep('done');
      setProgress('');
      setTimeout(() => onComplete(newSlides), 800);
    } catch (err) {
      setError(err.message);
      setStep('upload');
      setFile(null);
      setProgress('');
    }
  };

  const handleFileSelect = (e) => {
    handleFileAndGenerate(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileAndGenerate(e.dataTransfer.files[0]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="font-bold text-lg text-slate-800">AI 소개서 자동 생성</h2>
          <p className="text-sm text-slate-500 mt-1">회사 소개 문서를 업로드하면 AI가 슬라이드를 자동으로 채워드립니다.</p>
        </div>

        <div className="p-6">
          {/* Step 1: 파일 업로드 */}
          {step === 'upload' && (
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition cursor-pointer"
                onClick={() => document.getElementById('onboarding-file-input').click()}
              >
                <div className="text-4xl mb-3">📄</div>
                <p className="font-semibold text-slate-700">파일을 드래그하거나 클릭하여 업로드</p>
                <p className="text-sm text-slate-400 mt-1">PDF, DOC, DOCX 지원</p>
                <input
                  id="onboarding-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Step 2: 로딩 */}
          {step === 'loading' && (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="font-semibold text-slate-700">{progress}</p>
              <p className="text-sm text-slate-400 mt-1">잠시만 기다려주세요...</p>
            </div>
          )}

          {/* Step 4: 완료 */}
          {step === 'done' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-bold text-lg text-slate-800">슬라이드 생성 완료!</p>
              <p className="text-sm text-slate-500 mt-1">AI가 문서 내용을 슬라이드에 배치했습니다.</p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 rounded-xl">
              <p className="text-sm text-red-600 font-medium" style={{ whiteSpace: 'pre-line' }}>{error}</p>
            </div>
          )}

          {/* 진행 상태 (upload/configure 단계에서만) */}
          {progress && step !== 'loading' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-600 font-medium">{progress}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'loading' && step !== 'done' && (
          <div className="px-6 pb-5">
            <button
              onClick={onSkip}
              className="w-full py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-600 transition"
            >
              건너뛰고 직접 작성하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
