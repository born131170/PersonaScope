import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { searchSimilarEpisodes } from '../utils/analysisEngine';
import { Search, Upload, Fingerprint, ArrowRight, Clock, Eye, Loader2 } from 'lucide-react';
import { VideoFrame } from '../types';

export function SearchPanel() {
  const { analysis, fingerprints, searchResults, setSearchResults } = useAppStore();
  const [searchMode, setSearchMode] = useState<'fingerprint' | 'upload'>('fingerprint');
  const [selectedFingerprint, setSelectedFingerprint] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [results, setResults] = useState<VideoFrame[]>([]);

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (searchMode === 'fingerprint' && selectedFingerprint && analysis) {
      const fp = fingerprints.find(f => f.id === selectedFingerprint);
      if (fp) {
        const allFrames = [
          ...Object.values(analysis.bigFive).flatMap(t => t.evidence),
          ...analysis.mbti.evidence,
          ...analysis.enneagram.evidence,
          ...analysis.temperament.evidence,
          ...analysis.truthfulness.evidence,
        ];
        const found = searchSimilarEpisodes(fp, allFrames);
        setResults(found);
        setSearchResults(found);
      }
    } else {
      // Simulate results for uploaded image search
      const mockResults: VideoFrame[] = Array.from({ length: 4 }, (_, i) => ({
        id: `search-${i}`,
        timestamp: Math.random() * 120,
        imageData: '',
        description: [
          'Similar eyebrow raise pattern detected',
          'Matching hand gesture sequence found',
          'Comparable micro-expression cluster',
          'Similar posture and body orientation',
        ][i],
        microExpression: ['Eyebrow raise', 'Lip corner pull', 'Chin raise', 'Head tilt'][i],
        gesture: ['Open palm', 'Pointing', 'Self-touch', 'Crossed arms'][i],
        confidence: 0.65 + Math.random() * 0.3,
      }));
      setResults(mockResults);
      setSearchResults(mockResults);
    }
    setIsSearching(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Episode Search</h2>
        <p className="text-gray-400">Find similar behavioral episodes using digital fingerprints or uploaded reference images.</p>
      </div>

      {/* Search Mode */}
      <div className="flex gap-4">
        <button
          onClick={() => setSearchMode('fingerprint')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
            searchMode === 'fingerprint'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          Search by Fingerprint
        </button>
        <button
          onClick={() => setSearchMode('upload')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
            searchMode === 'upload'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          Search by Image
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Search Input */}
        <div className="col-span-1 space-y-4">
          {searchMode === 'fingerprint' ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Select Fingerprint</h3>
              {fingerprints.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-gray-900/30 border border-gray-800">
                  <Fingerprint className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No fingerprints available</p>
                  <p className="text-xs text-gray-600 mt-1">Create fingerprints in the Digital Fingerprint tab</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fingerprints.map((fp) => (
                    <button
                      key={fp.id}
                      onClick={() => setSelectedFingerprint(fp.id)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedFingerprint === fp.id
                          ? 'bg-violet-500/20 border border-violet-500/30'
                          : 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-200">{fp.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Duration: {fp.duration.toFixed(1)}s</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Upload Reference Image</h3>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-gray-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="search-image"
                />
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Reference" className="max-h-40 mx-auto rounded-lg" />
                ) : (
                  <label htmlFor="search-image" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload reference image</p>
                    <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 10MB</p>
                  </label>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={isSearching || (searchMode === 'fingerprint' ? !selectedFingerprint : !uploadedImage)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Find Similar Episodes
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">
            Search Results {results.length > 0 && `(${results.length} matches)`}
          </h3>
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center rounded-2xl bg-gray-900/30 border border-gray-800">
              <Search className="w-12 h-12 text-gray-700 mb-3" />
              <p className="text-gray-500">No results yet</p>
              <p className="text-xs text-gray-600 mt-1">Select a fingerprint or upload an image to search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {results.map((result, idx) => (
                <div key={result.id} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-violet-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400">
                          {Math.floor(result.timestamp / 60)}:{Math.floor(result.timestamp % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-400 mt-0.5">
                        Match: {Math.round(result.confidence * 100)}%
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-gray-500">#{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300">{result.description}</p>
                  <div className="flex gap-2 mt-3">
                    {result.microExpression && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {result.microExpression}
                      </span>
                    )}
                    {result.gesture && (
                      <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {result.gesture}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
