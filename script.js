import React, { useState } from 'react'
import ReactDOM from 'react-dom'

// Mocking UI components since we can't import them directly in this environment
const Button = ({ children, ...props }) => <button {...props}>{children}</button>
const Input = ({ ...props }) => <input {...props} />
const Label = ({ children, ...props }) => <label {...props}>{children}</label>
const Card = ({ children, ...props }) => <div {...props}>{children}</div>
const CardHeader = ({ children, ...props }) => <div {...props}>{children}</div>
const CardTitle = ({ children, ...props }) => <h2 {...props}>{children}</h2>
const CardDescription = ({ children, ...props }) => <p {...props}>{children}</p>
const CardContent = ({ children, ...props }) => <div {...props}>{children}</div>
const CardFooter = ({ children, ...props }) => <div {...props}>{children}</div>
const Tabs = ({ children, ...props }) => <div {...props}>{children}</div>
const TabsContent = ({ children, ...props }) => <div {...props}>{children}</div>
const TabsList = ({ children, ...props }) => <div {...props}>{children}</div>
const TabsTrigger = ({ children, ...props }) => <button {...props}>{children}</button>
const Carousel = ({ children, ...props }) => <div {...props}>{children}</div>
const CarouselContent = ({ children, ...props }) => <div {...props}>{children}</div>
const CarouselItem = ({ children, ...props }) => <div {...props}>{children}</div>
const CarouselNext = ({ children, ...props }) => <button {...props}>{children}</button>
const CarouselPrevious = ({ children, ...props }) => <button {...props}>{children}</button>
const Checkbox = ({ ...props }) => <input type="checkbox" {...props} />
const RadioGroup = ({ children, ...props }) => <div {...props}>{children}</div>
const RadioGroupItem = ({ ...props }) => <input type="radio" {...props} />

// Mock icons
const Mail = () => <span>📧</span>
const Chrome = () => <span>🌐</span>
const CheckCircle = () => <span>✅</span>
const ChevronLeft = () => <span>◀</span>
const ChevronRight = () => <span>▶</span>

// Mock Google Login component
const GoogleLogin = ({ render }) => {
  const renderProps = {
    onClick: () => console.log('Google login clicked'),
    disabled: false
  }
  return render(renderProps)
}

const evolutionSteps = [
  {
    title: "衝撃の真実：AIは思ったほど賢くない！",
    description: "世間が騒ぐAIチャットボット、実は大きな落とし穴があります。確かに一般知識は豊富ですが、いざ企業の専門知識となると途端に歯が立ちません。製品詳細？社内プロセス？業界用語？まるで新入社員以下の理解力です。複雑な問題には対応できず、顧客の真意を掴めないことも。この段階では、人間の専門家なしでは全く機能しないのです。"
  },
  {
    title: "学習期：急速な成長の兆し",
    description: "しかし、諦めるのはまだ早い！AIチャットボットは日々の対話から驚くべき速さで学習します。人間からのフィードバックを吸収し、専門知識を着実に蓄積。企業固有の情報をインプットすることで、徐々に的確な回答ができるように。この段階で、単なるツールから「学習する同僚」へと変貌を遂げ始めるのです。"
  },
  {
    title: "成熟期：人間を凌駕する専門性",
    description: "ここからが本当の驚きです。適切な育成を行えば、AIチャットボットは短期間で人間のエキスパートを追い抜きます。24時間365日休まず稼働し、膨大な知識を瞬時に検索・適用する能力は、もはや人智を超えています。複雑な問題も、過去の全事例と最新情報を総合し、最適な解決策を瞬時に提示。人間にはできない芸当を次々と披露します。"
  },
  {
    title: "革新期：顧客サポートの常識を覆す",
    description: "この段階のAIは、もはや単なるサポートツールではありません。顧客の行動を予測し、問題が起きる前に解決策を提案。製品改善のアイデアを開発チームに提供し、ビジネス全体を変革します。さらに、人間顔負けの自然な会話と感情理解により、真の「カスタマーエクスペリエンス」を提供。従来の顧客サポートの概念を根底から覆すのです。"
  },
  {
    title: "未来：AI×人間の究極の共創",
    description: "AIの進化の先に待っているのは、人間との驚くべき共創です。AIは超人的なデータ処理と分析を担当し、人間は比類なき創造性とエンパシーを発揮。この化学反応により、かつて夢想だにしなかったレベルの顧客サービスが実現します。もはやAIは道具ではなく、ビジネスの成功に不可欠なパートナー。人間とAIが織りなす新たな未来が、今まさに幕を開けようとしているのです。"
  }
]

const goalOptions = [
  "顧客サポートの効率化",
  "24時間対応の実現",
  "コスト削減",
  "顧客満足度の向上",
  "その他"
]

const needOptions = [
  "FAQの自動回答",
  "商品推薦",
  "予約管理",
  "問い合わせ対応",
  "その他"
]

function CompleteRegistrationFlow() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    email: '',
    nameKanji: '',
    nameKana: '',
    phone: '',
    company: '',
    goals: [],
    otherGoal: '',
    needs: [],
    otherNeed: '',
    hasManual: false,
    canProvideManual: false,
    urls: [''],
    icon: null,
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1sHmnsqEecgFpgEfzBunxYRq8_n4AvaRCF2eDyKbZBAI/edit?usp=sharing'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleCheckboxChange = (name, checked) => {
    setFormData(prevData => ({ ...prevData, [name]: checked }))
  }

  const handleMultiSelectChange = (name, value) => {
    setFormData(prevData => {
      const updatedValues = prevData[name].includes(value)
        ? prevData[name].filter(item => item !== value)
        : [...prevData[name], value]
      return { ...prevData, [name]: updatedValues }
    })
  }

  const handleUrlChange = (index, value) => {
    setFormData(prevData => {
      const newUrls = [...prevData.urls]
      newUrls[index] = value
      return { ...prevData, urls: newUrls }
    })
  }

  const addUrlField = () => {
    if (formData.urls.length < 10) {
      setFormData(prevData => ({ ...prevData, urls: [...prevData.urls, ''] }))
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.size <= 2 * 1024 * 1024) {  // 2MB limit
      setFormData(prevData => ({ ...prevData, icon: file }))
    } else {
      alert('ファイルサイズは2MB以下にしてください。')
    }
  }

  const handleNextStep = () => setStep(step + 1)
  const handlePrevStep = () => setStep(step - 1)

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    handleNextStep()
  }

  const handleGoogleSuccess = (response) => {
    const { email, name } = response.profileObj
    setFormData(prevData => ({ ...prevData, email, nameKanji: name }))
    handleNextStep()
  }

  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In failed:', error)
  }

  const renderStepIndicator = () => {
    const steps = ['紹介', '登録', '基本情報', 'ニーズ', '資料', '完了']
    return (
      <div className="flex justify-between items-center mb-4 px-2">
        {steps.map((stepName, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === step ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-500'}`}>
              {index + 1}
            </div>
            <span className="text-xs mt-1">{stepName}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Card className="w-full max-w-[350px] mx-auto">
            {renderStepIndicator()}
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl md:text-2xl leading-tight text-center">
                AIチャットボット：<br />期待外れから驚異の進化へ
              </CardTitle>
            </CardHeader>
            <Carousel className="w-full">
              <CarouselContent>
                {evolutionSteps.map((evolStep, index) => (
                  <CarouselItem key={index}>
                    <Card className="border-0 shadow-none">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg md:text-xl whitespace-pre-line">{evolStep.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm sm:text-base">{evolStep.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-center mt-4 space-x-2">
                <CarouselPrevious variant="outline" size="icon" className="static w-8 h-8 rounded-full">
                  <ChevronLeft className="h-4 w-4" />
                </CarouselPrevious>
                <CarouselNext variant="outline" size="icon" className="static w-8 h-8 rounded-full">
                  <ChevronRight className="h-4 w-4" />
                </CarouselNext>
              </div>
            </Carousel>
            <CardFooter>
              <Button className="w-full" onClick={handleNextStep}>無料トライアルに進む</Button>
            </CardFooter>
          </Card>
        )
      case 1:
        return (
          <Card className="w-full max-w-[350px] mx-auto">
            {renderStepIndicator()}
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                AIチャットボット<br />無料トライアル登録
              </CardTitle>
              <CardDescription className="text-center">
                まずはメールアドレスを登録してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">メール</TabsTrigger>
                  <TabsTrigger value="google">Google</TabsTrigger>
                </TabsList>
                <TabsContent value="email">
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      メールで登録
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="google">
                  <GoogleLogin
                    clientId="YOUR_GOOGLE_CLIENT_ID"
                    render={(renderProps) => (
                      <Button
                        onClick={renderProps.onClick}
                        disabled={renderProps.disabled}
                        className="w-full"
                      >
                        <Chrome className="w-4 h-4 mr-2" />
                        Googleで登録
                      </Button>
                    )}
                    onSuccess={handleGoogleSuccess}
                    onFailure={handleGoogleFailure}
                    cookiePolicy={'single_host_origin'}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>戻る</Button>
            </CardFooter>
          </Card>
        )
      case 2:
        return (
          <Card className="w-full max-w-[350px] mx-auto">
            {renderStepIndicator()}
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl md:text-2xl leading-tight text-center">基本情報</CardTitle>
              <CardDescription>お客様の情報をお聞かせください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nameKanji">お名前(漢字)*</Label>
                <Input
                  id="nameKanji"
                  name="nameKanji"
                  placeholder="山田 太郎"
                  value={formData.nameKanji}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameKana">お名前(カタカナ全角)*</Label>
                <Input
                  id="nameKana"
                  name="nameKana"
                  placeholder="ヤマダ タロウ"
                  value={formData.nameKana}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号*</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="000-0000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">会社名</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="株式会社〇〇"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>戻る</Button>
              <Button onClick={handleNextStep}>次へ</Button>
            </CardFooter>
          </Card>
        )
      case 3:
        return (
          <Card className="w-full max-w-[350px] mx-auto">
            {renderStepIndicator()}
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl md:text-2xl leading-tight text-center">
                目標と具体的なニーズ
              </CardTitle>
              <CardDescription>AIチャットボット導入の目的をお聞かせください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>導入目標*</Label>
                {goalOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`goal-${option}`}
                      checked={formData.goals.includes(option)}
                      onCheckedChange={(checked) => handleMultiSelectChange('goals', option)}
                    />
                    <Label htmlFor={`goal-${option}`}>{option}</Label>
                  </div>
                ))}
                {formData.goals.includes('その他') && (
                  <Input
                    placeholder="その他の目標を入力してください"
                    value={formData.otherGoal}
                    onChange={(e) => handleInputChange({ target: { name: 'otherGoal', value: e.target.value } })}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>具体的なニーズ*</Label>
                {needOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`need-${option}`}
                      checked={formData.needs.includes(option)}
                      onCheckedChange={(checked) => handleMultiSelectChange('needs', option)}
                    />
                    <Label htmlFor={`need-${option}`}>{option}</Label>
                  </div>
                ))}
                {formData.needs.includes('その他') && (
                  <Input
                    placeholder="その他のニーズを入力してください"
                    value={formData.otherNeed}
                    onChange={(e) => handleInputChange({ target: { name: 'otherNeed', value: e.target.value } })}
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>戻る</Button>
              <Button onClick={handleNextStep}>次へ</Button>
            </CardFooter>
          </Card>
        )
      case 4:
        return (
          <Card className="w-full max-w-[350px] mx-auto">
            {renderStepIndicator()}
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl md:text-2xl leading-tight text-center">
                資料とカスタマイズ
              </CardTitle>
              <CardDescription>Q&Aマニュアルと参考URLをお聞かせください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Q&Aマニュアルファイル (PDF, CSV等) の有無</Label>
                <RadioGroup defaultValue="no">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="hasManual-yes" onClick={() => handleCheckboxChange('hasManual', true)} />
                    <Label htmlFor="hasManual-yes">あり</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hasManual-no" onClick={() => handleCheckboxChange('hasManual', false)} />
                    <Label htmlFor="hasManual-no">なし</Label>
                  </div>
                </RadioGroup>
              </div>
              {formData.hasManual && (
                <div className="space-y-2">
                  <Label>資料のご提供</Label>
                  <RadioGroup defaultValue="no">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="canProvideManual-yes" onClick={() => handleCheckboxChange('canProvideManual', true)} />
                      <Label htmlFor="canProvideManual-yes">可能</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="canProvideManual-no" onClick={() => handleCheckboxChange('canProvideManual', false)} />
                      <Label htmlFor="canProvideManual-no">不可能</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
              <div className="space-y-2">
                <Label>参考にして欲しい内容のURL (最大10個)</Label>
                {formData.urls.map((url, index) => (
                  <Input
                    key={index}
                    placeholder={`URL ${index + 1}`}
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                  />
                ))}
                {formData.urls.length < 10 && (
                  <Button onClick={addUrlField} variant="outline" className="w-full mt-2">
                    URLを追加
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="spreadsheetUrl">Googleスプレッドシート URL</Label>
                <Input
                  id="spreadsheetUrl"
                  name="spreadsheetUrl"
                  value={formData.spreadsheetUrl}
                  onChange={handleInputChange}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
              </div>
              <div className="space-y-2">
                <Label>アイコンのアップロード (400x400 px, 最大2MB)</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileUpload}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>戻る</Button>
              <Button onClick={handleNextStep}>登録完了</Button>
            </CardFooter>
          </Card>
        )
      case 5:
        return (
          <Card className="w-full max-w-[350px] mx-auto">
            {renderStepIndicator()}
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl md:text-2xl leading-tight text-center">登録完了</CardTitle>
              <CardDescription>ありがとうございます！</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <p className="text-center text-sm text-gray-500">
                  登録が完了しました。ご登録いただいたメールアドレスに、
                  トライアルチャットボットのリンクをお送りしました。
                </p>
                <div className="space-y-2 w-full">
                  <p><strong>メールアドレス:</strong> {formData.email}</p>
                  <p><strong>お名前:</strong> {formData.nameKanji}</p>
                  <p><strong>会社名:</strong> {formData.company}</p>
                  <p><strong>トライアル開始日:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>トライアル終了日:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">メールを確認する</Button>
            </CardFooter>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {renderStep()}
    </div>
  )
}

ReactDOM.render(<CompleteRegistrationFlow />, document.getElementById('root'))