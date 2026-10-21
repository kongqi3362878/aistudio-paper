import React from 'react';
import { PageKey } from '../../types';
import BrandLogo from '../common/BrandLogo';

interface LegalDocumentViewProps {
  initialType?: 'terms' | 'privacy';
  onNavigate: (page: PageKey) => void;
  onBack?: () => void;
}

export default function LegalDocumentView({
  initialType = 'terms',
  onNavigate,
  onBack,
}: LegalDocumentViewProps) {
  const [docType, setDocType] = React.useState<'terms' | 'privacy'>(initialType);

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else {
      onNavigate('landing');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      {/* 1. Exact Topbar from Screenshot (Logo on left, '返回登录' on right) */}
      <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-12 h-16 sm:h-20 flex items-center justify-between">
          <BrandLogo onClick={() => onNavigate('landing')} />

          <div className="flex items-center gap-6">
            {/* Document switch tabs */}
            <div className="hidden sm:flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDocType('terms')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  docType === 'terms'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                用户服务协议
              </button>
              <button
                type="button"
                onClick={() => setDocType('privacy')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  docType === 'privacy'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                隐私政策
              </button>
            </div>

            {/* Exact "返回登录" link from screenshot */}
            <button
              id="btn-return-login"
              type="button"
              onClick={handleReturn}
              className="text-[#2563EB] hover:text-[#1D4ED8] text-sm font-medium transition-colors cursor-pointer"
            >
              返回登录
            </button>
          </div>
        </div>
      </header>

      {/* Mobile doc switcher */}
      <div className="sm:hidden flex items-center justify-center gap-3 p-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setDocType('terms')}
          className={`px-3 py-1.5 rounded-lg ${
            docType === 'terms' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
          }`}
        >
          用户服务协议
        </button>
        <button
          type="button"
          onClick={() => setDocType('privacy')}
          className={`px-3 py-1.5 rounded-lg ${
            docType === 'privacy' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500'
          }`}
        >
          隐私政策
        </button>
      </div>

      {/* 2. Document Content Container (Exact text and layout from screenshots) */}
      <main className="flex-1 w-full max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-16">
        {docType === 'terms' ? (
          /* ========================================================== */
          /* 用户服务协议 (Exact Text from Screenshot 1) */
          /* ========================================================== */
          <article className="space-y-8 text-slate-900 leading-relaxed text-[15px] sm:text-base">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                用户服务协议
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-mono">
                生效日期：2026年8月21日
              </p>
            </div>

            <p className="text-slate-800 leading-relaxed pt-2">
              欢迎使用论文智检（网址：
              <a 
                href="https://paper.zhuohuian.cn" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-600 hover:underline"
              >
                https://paper.zhuohuian.cn
              </a>
              ，以下简称「本平台」）。本平台互联网信息服务已办理 ICP 备案，备案号为鄂ICP备2026023941号-2。运营主体信息以工业和信息化部 ICP 备案系统公示内容为准。用户使用本平台服务前，应当认真阅读并同意本协议。
            </p>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                一、服务内容
              </h2>
              <p className="text-slate-800 leading-relaxed">
                本平台向用户提供论文规范性检测服务，包括文稿上传、自动检测及检测报告查阅。用户可通过本人中国大陆手机号码接收短信验证码完成登录；尚未注册的手机号码在验证通过后由本平台创建账号。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                二、账号使用
              </h2>
              <p className="text-slate-800 leading-relaxed">
                手机号码为账号登录凭证。用户应当使用本人号码，不得冒用他人号码注册或登录。本平台有权对违法违规或存在安全风险的账号采取限制或停止服务等措施。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                三、用户内容
              </h2>
              <p className="text-slate-800 leading-relaxed">
                用户上传的文稿仅用于向其提供检测服务。检测结果由规则与模型生成，可能存在误差，不得作为学位授予、期刊发表或其他正式评审的唯一依据。用户对上传内容的合法性、真实性负责。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                四、费用
              </h2>
              <p className="text-slate-800 leading-relaxed">
                部分功能可能收取费用或消耗配额，具体以本平台页面公示为准。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                五、责任限制
              </h2>
              <p className="text-slate-800 leading-relaxed">
                因网络、第三方服务或不可抗力导致的服务中断，本平台将在合理范围内处理，但不超出法定范围的损失承担责任。本平台不对检测结果的完整性、适用性作保证。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                六、变更与联系
              </h2>
              <p className="text-slate-800 leading-relaxed">
                本平台修改本协议的，将在本页面公布。用户如不同意修改内容，应当停止使用本服务。用户可通过本平台
                <button
                  type="button"
                  onClick={() => onNavigate('feedback')}
                  className="text-blue-600 hover:underline font-semibold mx-1 cursor-pointer"
                >
                  「意见反馈」
                </button>
                提出咨询或投诉。
              </p>
            </section>
          </article>
        ) : (
          /* ========================================================== */
          /* 隐私政策 (Exact Text from Screenshot 2) */
          /* ========================================================== */
          <article className="space-y-8 text-slate-900 leading-relaxed text-[15px] sm:text-base">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                隐私政策
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-mono">
                生效日期：2026年8月21日
              </p>
            </div>

            <p className="text-slate-800 leading-relaxed pt-2">
              本平台重视用户个人信息保护。本政策说明本平台处理个人信息的目的、方式和范围。本平台处理个人信息，遵循合法、正当、必要和诚信原则。根据《中华人民共和国个人信息保护法》等相关法律法规，用户使用本平台服务前，应当认真阅读本政策。
            </p>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                一、收集的信息
              </h2>
              <p className="text-slate-800 leading-relaxed">
                为完成账号注册与登录，本平台收集用户的手机号码及短信验证码核验结果。为提供检测服务，本平台处理用户上传的文稿、检测记录及账号资料。为保障安全与依法留存日志，本平台记录登录时间、互联网协议地址等信息，留存期限不少于六十日。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                二、处理目的
              </h2>
              <p className="text-slate-800 leading-relaxed">
                用于身份核验、提供检测、防范滥用与滥用、计费结算及客户服务。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                三、委托处理
              </h2>
              <p className="text-slate-800 leading-relaxed">
                短信验证码由阿里云计算有限公司号码认证服务（短信认证）发送。对象存储、大模型等云服务仅用于实现既有功能。本平台要求相关接收方依法保护个人信息。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                四、存储与保护
              </h2>
              <p className="text-slate-800 leading-relaxed">
                本平台采用加密传输等合理安全措施。短信验证码仅在约定期限内有效，核验后失效。本平台不向其他用户展示完整手机号码。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                五、用户权利
              </h2>
              <p className="text-slate-800 leading-relaxed">
                用户可在账号中查阅、更正个人信息。用户申请注销账号的，可通过
                <button
                  type="button"
                  onClick={() => onNavigate('feedback')}
                  className="text-blue-600 hover:underline font-semibold mx-1 cursor-pointer"
                >
                  「意见反馈」
                </button>
                提交，本平台将在核实身份后依法处理。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                六、未成年人
              </h2>
              <p className="text-slate-800 leading-relaxed">
                本服务不面向未满十四周岁的未成年人。如发现相关使用，本平台将停止服务并依法处理个人信息。
              </p>
            </section>

            <section className="space-y-2 pt-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                七、生效与更新
              </h2>
              <p className="text-slate-800 leading-relaxed">
                本政策如有更新，以本页面公布的日期为准。生效日期：2026年8月21日。
              </p>
            </section>
          </article>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="w-full border-t border-slate-100 py-8 bg-white text-xs text-slate-400">
        <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setDocType('terms')}
              className={`hover:text-slate-600 cursor-pointer ${docType === 'terms' ? 'font-bold text-slate-800' : ''}`}
            >
              用户服务协议
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setDocType('privacy')}
              className={`hover:text-slate-600 cursor-pointer ${docType === 'privacy' ? 'font-bold text-slate-800' : ''}`}
            >
              隐私政策
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onNavigate('feedback')}
              className="hover:text-slate-600 cursor-pointer"
            >
              意见反馈
            </button>
          </div>
          <div>
            © 2026 论文智检. 保留所有权利。 | 鄂ICP备2026023941号-2
          </div>
        </div>
      </footer>
    </div>
  );
}
