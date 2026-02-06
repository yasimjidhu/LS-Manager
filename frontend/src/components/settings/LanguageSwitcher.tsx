import { Globe } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAlert } from '../ui';

const LanguageSwitcher = () => {
    const { language, setLanguage, t } = useTranslation();
    const alert = useAlert();

    const handleLanguageChange = (newLang: 'en' | 'ml') => {
        setLanguage(newLang);
        alert.success(
            t('settings.languageUpdated'),
            t('settings.languageUpdatedMessage')
        );
    };

    return (
        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Globe className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{t('settings.language')}</h3>
                    <p className="text-sm text-gray-400">{t('settings.selectLanguage')}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleLanguageChange('en')}
                    className={`p-4 rounded-xl border-2 transition-all ${language === 'en'
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                            : 'border-[#1F2937] bg-[#0B0E14] text-gray-400 hover:border-gray-600'
                        }`}
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">🇬🇧</span>
                        <span className="font-semibold text-sm">{t('settings.english')}</span>
                        {language === 'en' && (
                            <span className="text-xs bg-cyan-500/20 text-cyan-500 px-2 py-0.5 rounded-full">
                                {t('common.active')}
                            </span>
                        )}
                    </div>
                </button>

                <button
                    onClick={() => handleLanguageChange('ml')}
                    className={`p-4 rounded-xl border-2 transition-all ${language === 'ml'
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                            : 'border-[#1F2937] bg-[#0B0E14] text-gray-400 hover:border-gray-600'
                        }`}
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">🇮🇳</span>
                        <span className="font-semibold text-sm">{t('settings.malayalam')}</span>
                        {language === 'ml' && (
                            <span className="text-xs bg-cyan-500/20 text-cyan-500 px-2 py-0.5 rounded-full">
                                {t('common.active')}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400">
                    <strong>{t('common.info')}:</strong>{' '}
                    {language === 'en'
                        ? 'The entire system interface will be displayed in the selected language.'
                        : 'തിരഞ്ഞെടുത്ത ഭാഷയിൽ മുഴുവൻ സിസ്റ്റം ഇന്റർഫേസും പ്രദർശിപ്പിക്കും.'}
                </p>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
