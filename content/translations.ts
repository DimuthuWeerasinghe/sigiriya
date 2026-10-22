// Each row contains the English key, Sinhala text, and Tamil text.
// Keep these keys independent of route paths and filter values.
const entries = `
Home|මුල් පිටුව|முகப்பு
Services|සේවා|சேவைகள்
Council|සභාව|சபை
Notices|නිවේදන|அறிவிப்புகள்
Community|ප්‍රජාව|சமூகம்
Downloads|බාගත කිරීම්|பதிவிறக்கங்கள்
Contact|සම්බන්ධ වන්න|தொடர்பு
Dambulla & Sigiriya|දඹුල්ල හා සීගිරිය|தம்புள்ளை மற்றும் சீகிரியா
Culture|සංස්කෘතිය|கலாசாரம்
Heritage|උරුමය|மரபுரிமை
Gallery|ගැලරිය|படத்தொகுப்பு
Nature|සොබාදහම|இயற்கை
Access Services|සේවා ලබාගන්න|சேவைகளைப் பெறுக
Dambulla Pradeshiya Sabha|දඹුල්ල ප්‍රාදේශීය සභාව|தம்புள்ளை பிரதேச சபை
Dambulla Pradeshiya Sabha home|දඹුල්ල ප්‍රාදේශීය සභාවේ මුල් පිටුව|தம்புள்ளை பிரதேச சபையின் முகப்பு
Language selection|භාෂාව තෝරන්න|மொழியைத் தேர்ந்தெடுக்கவும்
Main navigation|ප්‍රධාන සංචාලනය|முதன்மை வழிசெலுத்தல்
Section navigation|අංශ වෙත පිවිසීම|பிரிவு வழிசெலுத்தல்
Rates & Taxes|වරිපනම් හා බදු|மதிப்பீட்டு வரிகளும் வரிகளும்
Rates and Taxes|වරිපනම් හා බදු|மதிப்பீட்டு வரிகளும் வரிகளும்
Trade Licences|වෙළඳ බලපත්‍ර|வணிக உரிமங்கள்
Download Forms|ආකෘති බාගත කරන්න|படிவங்களைப் பதிவிறக்குக
Submit a Request|ඉල්ලීමක් යොමු කරන්න|கோரிக்கையைச் சமர்ப்பிக்கவும்
Track Application|අයදුම්පතේ තත්ත්වය බලන්න|விண்ணப்ப நிலையைக் காண்க
Coming soon|ළඟදීම|விரைவில்
Requirements pending|අවශ්‍යතා තහවුරු කිරීමට ඇත|தேவைகள் உறுதிப்படுத்தப்பட வேண்டும்
Official files pending|නිල ගොනු ලැබීමට ඇත|அதிகாரப்பூர்வக் கோப்புகள் நிலுவையில் உள்ளன
Prototype only|ආදර්ශයක් පමණි|முன்மாதிரி மட்டும்
Planned service|සැලසුම් කළ සේවාවකි|திட்டமிடப்பட்ட சேவை
Licences|බලපත්‍ර|உரிமங்கள்
Building Plan Approval|ගොඩනැගිලි සැලසුම් අනුමැතිය|கட்டடத் திட்ட அனுமதி
Construction|ඉදිකිරීම්|கட்டுமானம்
Complaints and Requests|පැමිණිලි හා ඉල්ලීම්|முறைப்பாடுகளும் கோரிக்கைகளும்
Public Requests|මහජන ඉල්ලීම්|பொதுமக்கள் கோரிக்கைகள்
Public requests|මහජන ඉල්ලීම්|பொதுமக்கள் கோரிக்கைகள்
Pending official confirmation|නිල තහවුරු කිරීම අපේක්ෂිතයි|அதிகாரப்பூர்வ உறுதிப்படுத்தல் நிலுவையில் உள்ளது
Guidance pending|මාර්ගෝපදේශ ලැබීමට ඇත|வழிகாட்டல் நிலுவையில் உள்ளது
Prototype: no data is submitted|ආදර්ශයකි: දත්ත යොමු නොකෙරේ|முன்மாதிரி: தரவுகள் அனுப்பப்படாது
Survey Plan Approval|මිනින්දෝරු සැලසුම් අනුමැතිය|நிலஅளவைத் திட்ட அனுமதி
Official checklist pending|නිල පිරික්සුම් ලැයිස්තුව ලැබීමට ඇත|அதிகாரப்பூர்வச் சரிபார்ப்புப் பட்டியல் நிலுவையில் உள்ளது
Pending|අපේක්ෂිතයි|நிலுவையில் உள்ளது
Street Line Certificates|වීථි රේඛා සහතික|வீதி எல்லைச் சான்றிதழ்கள்
Certificates|සහතික|சான்றிதழ்கள்
Official wording pending|නිල විස්තර ලැබීමට ඇත|அதிகாரப்பூர்வ உரை நிலுவையில் உள்ளது
Certificate of Conformity|අනුකූලතා සහතිකය|இணக்கச் சான்றிதழ்
Official requirements pending|නිල අවශ්‍යතා තහවුරු කිරීමට ඇත|அதிகாரப்பூர்வத் தேவைகள் நிலுவையில் உள்ளன
Waste Management|කසළ කළමනාකරණය|கழிவு முகாமைத்துவம்
Schedule pending|කාලසටහන තහවුරු කිරීමට ඇත|அட்டவணை நிலுவையில் உள்ளது
Download Application Forms|අයදුම්පත් බාගත කරන්න|விண்ணப்பப் படிவங்களைப் பதிவிறக்குக
Track Your Application|ඔබේ අයදුම්පතේ තත්ත්වය බලන්න|உங்கள் விண்ணப்ப நிலையைக் காண்க
Service Help Centre|සේවා උපකාර මධ්‍යස්ථානය|சேவை உதவி மையம்
Public Notice|මහජන නිවේදනය|பொது அறிவிப்பு
Public Information Update|මහජන තොරතුරු යාවත්කාලීන කිරීම|பொதுத் தகவல் புதுப்பிப்பு
Date to be confirmed|දිනය තහවුරු කිරීමට ඇත|திகதி உறுதிப்படுத்தப்பட வேண்டும்
Prototype label|ආදර්ශ සටහන|முன்மாதிரிக் குறிப்பு
Procurement|ප්‍රසම්පාදන|கொள்வனவு
Tender Notice|ටෙන්ඩර් නිවේදනය|கேள்விப்பத்திர அறிவிப்பு
Status pending|තත්ත්වය තහවුරු කිරීමට ඇත|நிலை உறுதிப்படுத்தப்பட வேண்டும்
Calendar|දින දර්ශනය|நாட்காட்டி
Community Programme|ප්‍රජා වැඩසටහන|சமூக நிகழ்ச்சி
Draft item|කෙටුම්පතකි|வரைவு
Gazette|ගැසට්|வர்த்தமானி
Official publication area|නිල ප්‍රකාශන අංශය|அதிகாரப்பூர்வ வெளியீட்டுப் பகுதி
Reserved|වෙන් කර ඇත|ஒதுக்கப்பட்டுள்ளது
Good Governance|යහපාලනය|நல்லாட்சி
Sustainable Development|තිරසාර සංවර්ධනය|நிலையான அபிவிருத்தி
Performance|රංග කලාව|நிகழ்த்துக் கலை
Traditional performance|සාම්ප්‍රදායික රංග කලාව|பாரம்பரியக் கலை நிகழ்ச்சி
Local table|දේශීය ආහාර|உள்ளூர் உணவு
Hospitality is part of everyday heritage|ආගන්තුක සත්කාරය අපේ උරුමයේ කොටසකි|விருந்தோம்பல் அன்றாட மரபின் ஒரு பகுதியாகும்
Sigiriya|සීගිරිය|சீகிரியா
Rock fortress|පර්වත බලකොටුව|பாறைக் கோட்டை
Water gardens|ජල උද්‍යාන|நீர்த் தோட்டங்கள்
Fresco heritage|බිතුසිතුවම් උරුමය|சுவரோவிய மரபு
Mapagala|මාපාගල|மாப்பாகல
Archaeology|පුරාවිද්‍යාව|தொல்லியல்
Stonework|ශිලා නිර්මාණ|கல் கட்டுமானங்கள்
Verification pending|තහවුරු කිරීමට ඇත|உறுதிப்படுத்தப்பட வேண்டும்
Kaludiya Pokuna|කළුදිය පොකුණ|களுதிய பொக்குன
Forest setting|වනාන්තර පරිසරය|வனச் சூழல்
Historic site|ඓතිහාසික ස්ථානය|வரலாற்றுத் தலம்
Visitor details pending|සංචාරක තොරතුරු තහවුරු කිරීමට ඇත|பார்வையாளர் விவரங்கள் நிலுவையில் உள்ளன
Kandalama Lake|කණ්ඩලම වැව|கண்டலம வாவி
Lake landscape|වැව් පරිසරය|வாவி நிலப்பரப்பு
Local identity|දේශීය අනන්‍යතාව|உள்ளூர் அடையாளம்
Assessment and rates application|තක්සේරු හා වරිපනම් අයදුම්පත|மதிப்பீடு மற்றும் வரி விண்ணப்பம்
Application Forms|අයදුම්පත්|விண்ணப்பப் படிவங்கள்
Official file pending|නිල ගොනුව ලැබීමට ඇත|அதிகாரப்பூர்வக் கோப்பு நிலுவையில் உள்ளது
Year pending|වර්ෂය තහවුරු කිරීමට ඇත|ஆண்டு உறுதிப்படுத்தப்பட வேண்டும்
Sinhala / Tamil / English|සිංහල / දෙමළ / ඉංග්‍රීසි|சிங்களம் / தமிழ் / ஆங்கிலம்
Trade licence application|වෙළඳ බලපත්‍ර අයදුම්පත|வணிக உரிம விண்ணப்பம்
Sinhala|සිංහල|சிங்களம்
Building application checklist|ගොඩනැගිලි අයදුම්පත් පිරික්සුම් ලැයිස්තුව|கட்டட விண்ணப்பச் சரிபார்ப்புப் பட்டியல்
English|ඉංග්‍රීසි|ஆங்கிலம்
Citizen Charter|පුරවැසි ප්‍රඥප්තිය|பிரஜைகள் சாசனம்
Trilingual|ත්‍රෛභාෂික|மும்மொழி
Strategic Plan|උපාය මාර්ගික සැලැස්ම|மூலோபாயத் திட்டம்
Language pending|භාෂාව තහවුරු කිරීමට ඇත|மொழி உறுதிப்படுத்தப்பட வேண்டும்
Council activity|සභාවේ ක්‍රියාකාරකම්|சபைச் செயற்பாடு
School and awareness programme|පාසල් හා දැනුවත් කිරීමේ වැඩසටහන|பாடசாலை மற்றும் விழிப்புணர்வு நிகழ்ச்சி
Sigiriya water gardens|සීගිරි ජල උද්‍යාන|சீகிரியா நீர்த் தோட்டங்கள்
Living craft|සජීවී ශිල්ප කලාව|வாழும் கைவினை
Local life|දේශීය ජන ජීවිතය|உள்ளூர் வாழ்க்கை
Traditional food|සාම්ප්‍රදායික ආහාර|பாரம்பரிய உணவு
Nature of the wider Dambulla region|දඹුල්ල අවට සොබාදහම|தம்புள்ளை சுற்றுப்புற இயற்கை
Most Used|බහුලව භාවිත වන|அதிகம் பயன்படுத்தப்படும்
Forms|ආකෘති|படிவங்கள்
All|සියල්ල|அனைத்தும்
Council Reports|සභා වාර්තා|சபை அறிக்கைகள்
Budget Reports|අයවැය වාර්තා|வரவு செலவுத் திட்ட அறிக்கைகள்
Publications|ප්‍රකාශන|வெளியீடுகள்
Find service|සේවාව සොයන්න|சேவையைக் கண்டறிக
Check requirements|අවශ්‍යතා පරීක්ෂා කරන්න|தேவைகளைச் சரிபார்க்கவும்
Download or prepare form|ආකෘතිය බාගත කර හෝ සකස් කරගන්න|படிவத்தைப் பதிவிறக்கவும் அல்லது தயாரிக்கவும்
Submit|භාර දෙන්න|சமர்ப்பிக்கவும்
Track or follow up|තත්ත්වය විමසන්න|நிலையைப் பின்தொடரவும்
Report an Issue|ගැටලුවක් දන්වන්න|பிரச்சினையைத் தெரிவிக்கவும்
Our heritage|අපේ උරුමය|எமது மரபுரிமை
Dambulla, shaped by history, service and community.|ඉතිහාසය, සේවාව හා ප්‍රජාවෙන් හැඩගැසුණු දඹුල්ල.|வரலாறு, சேவை, சமூகத்தால் உருவான தம்புள்ளை.
Leadership|නායකත්වය|தலைமைத்துவம்
Message from the Chairman|සභාපතිතුමාගේ පණිවිඩය|தவிசாளரின் செய்தி
Official name pending confirmation|නිල නම තහවුරු කිරීමට ඇත|அதிகாரப்பூர்வப் பெயர் உறுதிப்படுத்தப்பட வேண்டும்
Chairman, Dambulla Pradeshiya Sabha|සභාපති, දඹුල්ල ප්‍රාදේශීය සභාව|தவிசாளர், தம்புள்ளை பிரதேச சபை
Message from the Secretary|ලේකම්තුමියගේ පණිවිඩය|செயலாளரின் செய்தி
A.L.S. Priyadarshani|ඒ. එල්. එස්. ප්‍රියදර්ශනී|ஏ. எல். எஸ். பிரியதர்ஷனி
Secretary, Dambulla Pradeshiya Sabha|ලේකම්, දඹුල්ල ප්‍රාදේශීය සභාව|செயலாளர், தம்புள்ளை பிரதேச சபை
Read full message|සම්පූර්ණ පණිවිඩය කියවන්න|முழுச் செய்தியையும் வாசிக்கவும்
Close modal|කවුළුව වසන්න|சாளரத்தை மூடவும்
Understood|තේරුණා|புரிந்தது
Skip to public services|මහජන සේවා වෙත යන්න|பொதுச் சேவைகளுக்குச் செல்லவும்
Official digital gateway|නිල ඩිජිටල් පිවිසුම|அதிகாரப்பூர்வ டிஜிட்டல் நுழைவாயில்
Welcome to the heart of Dambulla|දඹුල්ල පුරවරයට සාදරයෙන් පිළිගනිමු|தம்புள்ளையின் இதயத்திற்கு வரவேற்கிறோம்
Your gateway to|ඔබේ පිවිසුම|உங்கள் நுழைவாயில்
Dambulla|දඹුල්ල|தம்புள்ளை
& Sigiriya|හා සීගිරිය|மற்றும் சீகிரியா
Find a Council Service|සභාවේ සේවාවක් සොයන්න|சபைச் சேவையைக் கண்டறிக
Explore Dambulla & Sigiriya|දඹුල්ල හා සීගිරිය ගවේෂණය කරන්න|தம்புள்ளை மற்றும் சீகிரியாவைக் கண்டறிக
Quick council service links|සභා සේවා වෙත ඉක්මන් පිවිසුම්|சபைச் சேவைகளுக்கான விரைவு இணைப்புகள்
Quick public service actions|මහජන සේවා වෙත ඉක්මන් පිවිසුම්|பொதுச் சேவைகளுக்கான விரைவுச் செயல்கள்
Public services|මහජන සේවා|பொதுச் சேவைகள்
How can we help you today?|අද අපෙන් ඔබට කෙරෙන්න ඕනෑ මොනවාද?|இன்று நாங்கள் உங்களுக்கு எவ்வாறு உதவலாம்?
What service do you need?|ඔබට අවශ්‍ය සේවාව කුමක්ද?|உங்களுக்கு எந்தச் சேவை தேவை?
Search for a service, form or certificate...|සේවාවක්, ආකෘතියක් හෝ සහතිකයක් සොයන්න...|சேவை, படிவம் அல்லது சான்றிதழைத் தேடுக...
Search|සොයන්න|தேடுக
Service search suggestions|සේවා සෙවුම් යෝජනා|சேவைத் தேடல் பரிந்துரைகள்
Service categories|සේවා වර්ග|சேவை வகைகள்
Support|උපකාර|உதவி
View|බලන්න|காண்க
How to get a service|සේවාව ලබාගන්නා ආකාරය|சேவையைப் பெறுவது எப்படி
Official information|නිල තොරතුරු|அதிகாரப்பூர்வத் தகவல்கள்
Latest Notices & Updates|නවතම නිවේදන හා යාවත්කාලීන කිරීම්|அண்மைய அறிவிப்புகளும் புதுப்பிப்புகளும்
Featured notice|විශේෂ නිවේදනය|சிறப்பு அறிவிப்பு
Public information area|මහජන තොරතුරු අංශය|பொதுத் தகவல் பகுதி
Read notice|නිවේදනය කියවන්න|அறிவிப்பை வாசிக்கவும்
Information quick links|තොරතුරු වෙත ඉක්මන් පිවිසුම්|தகவல்களுக்கான விரைவு இணைப்புகள்
Tenders|ටෙන්ඩර්|கேள்விப்பத்திரங்கள்
Vacancies|පුරප්පාඩු|வெற்றிடங்கள்
Gazettes|ගැසට් නිවේදන|வர்த்தமானி அறிவிப்புகள்
Council sessions|සභා සැසි|சபை அமர்வுகள்
Our council|අපේ සභාව|எமது சபை
Vision, mission and public service|දැක්ම, මෙහෙවර හා මහජන සේවය|தூரநோக்கு, பணிக்கூற்று மற்றும் பொதுச் சேவை
Vision|දැක්ම|தூரநோக்கு
Mission|මෙහෙවර|பணிக்கூற்று
Community programmes|ප්‍රජා වැඩසටහන්|சமூக நிகழ்ச்சிகள்
People and programmes on the ground|ජනතාව හා ප්‍රජා වැඩසටහන්|மக்களும் கள நிகழ்ச்சிகளும்
Council event photograph|සභා වැඩසටහනක ඡායාරූපයක්|சபை நிகழ்ச்சியின் புகைப்படம்
Official content pending|නිල තොරතුරු ලැබීමට ඇත|அதிகாரப்பூர்வ உள்ளடக்கம் நிலுவையில் உள்ளது
Community programme coverage|ප්‍රජා වැඩසටහන් තොරතුරු|சமூக நிகழ்ச்சித் தொகுப்பு
Open news centre|පුවත් මධ්‍යස්ථානයට යන්න|செய்தி மையத்திற்குச் செல்லவும்
Cultural storytelling|සංස්කෘතික කතා|கலாசாரக் கதைகள்
Our living heritage|අපේ සජීවී උරුමය|எமது வாழும் மரபுரிமை
Culture, craft and everyday life|සංස්කෘතිය, ශිල්ප කලාව හා එදිනෙදා ජීවිතය|கலாசாரம், கைவினை மற்றும் அன்றாட வாழ்க்கை
Our living culture banner with traditional mask craft|සාම්ප්‍රදායික වෙස්මුහුණු කලාව දැක්වෙන සංස්කෘතික දසුනක්|பாரம்பரிய முகமூடிக் கைவினையுடன் எமது கலாசாரக் காட்சி
Culture links|සංස්කෘතික පිවිසුම්|கலாசார இணைப்புகள்
Craft|ශිල්ප කලාව|கைவினை
Food|ආහාර|உணவு
Living Heritage|සජීවී උරුමය|வாழும் மரபுரிமை
Craft and community|ශිල්ප කලාව හා ප්‍රජාව|கைவினையும் சமூகமும்
View community gallery|ප්‍රජා ගැලරිය බලන්න|சமூகப் படத்தொகுப்பைக் காண்க
Craftsman working on a traditional mask|සාම්ප්‍රදායික වෙස්මුහුණක් නිර්මාණය කරන ශිල්පියෙක්|பாரம்பரிய முகமூடியை உருவாக்கும் கைவினைஞர்
Local craft|දේශීය ශිල්ප කලාව|உள்ளூர் கைவினை
Explore Dambulla|දඹුල්ල ගවේෂණය කරන්න|தம்புள்ளையைக் கண்டறிக
Sigiriya rock fortress|සීගිරි පර්වත බලකොටුව|சீகிரியா பாறைக் கோட்டை
Visitor gateway|සංචාරක පිවිසුම|பார்வையாளர் நுழைவாயில்
A place to explore. A heritage to respect.|ගවේෂණයට තැනක්. ගෞරව කළ යුතු උරුමයක්.|கண்டறிய ஓர் இடம். மதிக்க வேண்டிய மரபுரிமை.
Explore destinations|සංචාරක ස්ථාන ගවේෂණය කරන්න|சுற்றுலாத் தலங்களைக் கண்டறிக
Visitors viewing Sigiriya from a scenic landscape|දර්ශනීය පරිසරයක සිට සීගිරිය නරඹන සංචාරකයෝ|அழகிய நிலப்பரப்பிலிருந்து சீகிரியாவைப் பார்வையிடும் சுற்றுலாப் பயணிகள்
Visitors overlooking Sigiriya at sunset|හිරු බැස යන විට සීගිරිය නරඹන සංචාරකයෝ|சூரிய அஸ்தமனத்தில் சீகிரியாவைப் பார்வையிடும் பயணிகள்
Gateway to Dambulla & Sigiriya|දඹුල්ල හා සීගිරිය වෙත පිවිසුම|தம்புள்ளை மற்றும் சீகிரியாவிற்கான நுழைவாயில்
Online Payments|මාර්ගගත ගෙවීම්|இணையவழிக் கொடுப்பனவுகள்
Online Booking|මාර්ගගත වෙන් කිරීම්|இணையவழி முன்பதிவுகள்
View status|තත්ත්වය බලන්න|நிலையைக் காண்க
Document centre|ලේඛන මධ්‍යස්ථානය|ஆவண மையம்
Documents, Forms & Publications|ලේඛන, ආකෘති හා ප්‍රකාශන|ஆவணங்கள், படிவங்கள் மற்றும் வெளியீடுகள்
Search forms and documents|ආකෘති හා ලේඛන සොයන්න|படிவங்களையும் ஆவணங்களையும் தேடுக
Moments from Dambulla|දඹුල්ලේ මතක දසුන්|தம்புள்ளையின் தருணங்கள்
Gallery categories|ගැලරි වර්ග|படத்தொகுப்பு வகைகள்
Dambulla gallery carousel|දඹුල්ල රූප පෙළ|தம்புள்ளை படச் சுழற்சி
Public assistance|මහජන සහාය|பொதுமக்கள் உதவி
Need help?|උදව් අවශ්‍යද?|உதவி தேவையா?
Contact the Council|සභාව අමතන්න|சபையைத் தொடர்புகொள்ளவும்
Find a Service|සේවාවක් සොයන්න|சேவையைக் கண்டறிக
Service links|සේවා පිවිසුම්|சேவை இணைப்புகள்
About|අප ගැන|எம்மைப் பற்றி
Vision & Mission|දැක්ම හා මෙහෙවර|தூரநோக்கும் பணிக்கூற்றும்
Rates|වරිපනම්|மதிப்பீட்டு வரிகள்
Requests|ඉල්ලීම්|கோரிக்கைகள்
Tourism links|සංචාරක පිවිසුම්|சுற்றுலா இணைப்புகள்
Explore|ගවේෂණය කරන්න|கண்டறிக
Destinations|සංචාරක ස්ථාන|சுற்றுலாத் தலங்கள்
Policy links|ප්‍රතිපත්ති පිවිසුම්|கொள்கை இணைப்புகள்
Access|ප්‍රවේශය|அணுகல்
Accessibility|ප්‍රවේශ පහසුකම්|அணுகல்தன்மை
Privacy|පෞද්ගලිකත්වය|தனியுரிமை
Sitemap|අඩවි සිතියම|தள வரைபடம்
Dambulla Pradeshiya Sabha, Dambulla|දඹුල්ල ප්‍රාදේශීය සභාව, දඹුල්ල|தம்புள்ளை பிரதேச சபை, தம்புள்ளை
Telephone and email pending final verification.|දුරකථන අංකය හා විද්‍යුත් තැපෑල තහවුරු කිරීමට ඇත.|தொலைபேசி மற்றும் மின்னஞ்சல் இறுதி உறுதிப்படுத்தலுக்காக நிலுவையில் உள்ளன.
Close gallery image|ඡායාරූපය වසන්න|படத்தை மூடவும்
Official Prototype|නිල වෙබ් අඩවි ආදර්ශය|அதிகாரப்பூர்வ முன்மாதிரி
About Dambulla Pradeshiya Sabha|දඹුල්ල ප්‍රාදේශීය සභාව ගැන|தம்புள்ளை பிரதேச சபையைப் பற்றி
Responsive local government|ජනතා අවශ්‍යතාවලට ප්‍රතිචාර දක්වන පළාත් පාලනය|மக்களின் தேவைகளுக்குப் பதிலளிக்கும் உள்ளூராட்சி
Practical civic support|ප්‍රායෝගික මහජන සහාය|நடைமுறைப் பொதுமக்கள் உதவி
Content Still Needing Verification|තවම තහවුරු කළ යුතු තොරතුරු|இன்னும் உறுதிப்படுத்தப்பட வேண்டிய தகவல்கள்
Accessibility Statement|ප්‍රවේශ පහසුකම් ප්‍රකාශය|அணுகல்தன்மை அறிக்கை
Submit a civic issue|පොදු ගැටලුවක් යොමු කරන්න|பொதுப் பிரச்சினையைச் சமர்ப்பிக்கவும்
Request details|ඉල්ලීමේ විස්තර|கோரிக்கை விவரங்கள்
Presentation-only request area|ආදර්ශ ඉල්ලීම් අංශය|முன்மாதிரிக் கோரிக்கைப் பகுதி
Submit request|ඉල්ලීම යොමු කරන්න|கோரிக்கையைச் சமர்ப்பிக்கவும்
Council Contact and Assistance|සභාවේ සම්බන්ධතා හා සහාය|சபைத் தொடர்பும் உதவியும்
Your message|ඔබේ පණිවිඩය|உங்கள் செய்தி
Presentation-only message area|ආදර්ශ පණිවිඩ අංශය|முன்மாதிரிச் செய்திப் பகுதி
Send enquiry|විමසීම යොමු කරන්න|விசாரணையை அனுப்பவும்
Forms and Documents|ආකෘති හා ලේඛන|படிவங்களும் ஆவணங்களும்
Documentary Image Library|වාර්තාමය ඡායාරූප එකතුව|ஆவணப் புகைப்படத் தொகுப்பு
Notices and News|නිවේදන හා පුවත්|அறிவிப்புகளும் செய்திகளும்
Policy|ප්‍රතිපත්තිය|கொள்கை
Council Services|සභාවේ සේවා|சபைச் சேவைகள்
Service Notes|සේවා සටහන්|சேவைக் குறிப்புகள்
Site Index|අඩවි දර්ශකය|தள அட்டவணை
All prototype sections and detail pages.|ආදර්ශ වෙබ් අඩවියේ සියලු අංශ හා විස්තර පිටු.|முன்மாதிரித் தளத்தின் அனைத்துப் பிரிவுகளும் விவரப் பக்கங்களும்.
Heritage and Visitor Places|උරුමය හා සංචාරක ස්ථාන|மரபுரிமை மற்றும் சுற்றுலாத் தலங்கள்
Destination|සංචාරක ස්ථානය|சுற்றுலாத் தலம்
Visitor Notes|සංචාරක සටහන්|பார்வையாளர் குறிப்புகள்
In-person service|කාර්යාලයට පැමිණ ලබාගත යුතු සේවාවකි|நேரில் பெறும் சேவை
Draft process|කෙටුම්පත් ක්‍රියාවලිය|வரைவு நடைமுறை
Building Applications|ගොඩනැගිලි අයදුම්පත්|கட்டட விண்ணப்பங்கள்
Guidance|මාර්ගෝපදේශ|வழிகாட்டல்
Council service|සභා සේවාව|சபைச் சேவை
Prototype form|ආදර්ශ ආකෘතිය|முன்மாதிரிப் படிவம்
PDFs pending|PDF ගොනු ලැබීමට ඇත|PDF கோப்புகள் நிலுவையில் உள்ளன
Community Programme Gallery|ප්‍රජා වැඩසටහන් ගැලරිය|சமூக நிகழ்ச்சிப் படத்தொகுப்பு
Service Announcement|සේවා නිවේදනය|சேவை அறிவிப்பு
Solid waste request form|ඝන අපද්‍රව්‍ය සේවා ඉල්ලුම්පත|திண்மக் கழிவுச் சேவைக் கோரிக்கைப் படிவம்
Complaint and request form|පැමිණිලි හා ඉල්ලීම් ආකෘතිය|முறைப்பாடு மற்றும் கோரிக்கைப் படிவம்
General certificate request|සාමාන්‍ය සහතික ඉල්ලීම|பொதுச் சான்றிதழ் கோரிக்கை
Dambulla Cave Temple|දඹුල්ල ලෙන් විහාරය|தம்புள்ளை குகைக் கோயில்
Address|ලිපිනය|முகவரி
Telephone|දුරකථන|தொலைபேசி
Email|විද්‍යුත් තැපෑල|மின்னஞ்சல்
Office hours|කාර්යාල වේලාවන්|அலுவலக நேரம்
To be verified from the final source document|අවසන් නිල ලේඛනය අනුව තහවුරු කිරීමට ඇත|இறுதி அதிகாரப்பூர்வ ஆவணத்தின் மூலம் உறுதிப்படுத்தப்பட வேண்டும்
News|පුවත්|செய்திகள்
Service|සේවාව|சேவை
Tourism|සංචාරක|சுற்றுலா
Cover carousel|රූප පෙළ|படச் சுழற்சி
Previous slide|පෙර රූපය|முந்தைய படம்
Next slide|ඊළඟ රූපය|அடுத்த படம்
Go to slide|රූපය වෙත යන්න|படத்திற்குச் செல்லவும்
of|/|/
`.trim().split('\n').map((line) => {
  const [key, sinhala, tamil] = line.split('|');
  return [key, [sinhala, tamil]];
});

export const translations: Record<string, [string, string]> = Object.fromEntries(entries);
const descriptions = `
Find rates guidance and related application requirements.|වරිපනම් පිළිබඳ මාර්ගෝපදේශ හා අදාළ අයදුම්පත් අවශ්‍යතා බලන්න.|மதிப்பீட்டு வரி வழிகாட்டலையும் தொடர்புடைய விண்ணப்பத் தேவைகளையும் காண்க.
Requirements: assessment number, property details|අවශ්‍යතා: වරිපනම් අංකය, දේපළ විස්තර|தேவைகள்: மதிப்பீட்டு இலக்கம், சொத்து விவரங்கள்
Application and renewal guidance for local businesses.|දේශීය ව්‍යාපාර සඳහා අයදුම් කිරීමේ හා අලුත් කිරීමේ මාර්ගෝපදේශ.|உள்ளூர் வணிகங்களுக்கான விண்ணப்ப மற்றும் புதுப்பித்தல் வழிகாட்டல்.
Requirements: business details, premises information|අවශ්‍යතා: ව්‍යාපාරයේ හා පරිශ්‍රයේ විස්තර|தேவைகள்: வணிக மற்றும் வளாக விவரங்கள்
Planning and approval guidance for building applications.|ගොඩනැගිලි අයදුම්පත් සඳහා සැලසුම් හා අනුමැති මාර්ගෝපදේශ.|கட்டட விண்ணப்பங்களுக்கான திட்டமிடல் மற்றும் அனுமதி வழிகாட்டல்.
Requirements: plans, location, ownership documents|අවශ්‍යතා: සැලසුම්, ස්ථානය, අයිතිය සනාථ කරන ලේඛන|தேவைகள்: திட்டங்கள், இடம், உரிமை ஆவணங்கள்
Submit a civic issue or service request for follow-up.|පසු විපරම සඳහා පොදු ගැටලුවක් හෝ සේවා ඉල්ලීමක් යොමු කරන්න.|பின்தொடர்வதற்காகப் பொதுப் பிரச்சினை அல்லது சேவைக் கோரிக்கையைச் சமர்ப்பிக்கவும்.
Check the documents needed for survey plan approval.|මිනින්දෝරු සැලසුම් අනුමැතියට අවශ්‍ය ලේඛන පරීක්ෂා කරන්න.|நிலஅளவைத் திட்ட அனுமதிக்குத் தேவையான ஆவணங்களைச் சரிபார்க்கவும்.
Find guidance for street line and non-acquisition certificates.|වීථි රේඛා හා නොපවරා ගැනීමේ සහතික සඳහා මාර්ගෝපදේශ බලන්න.|வீதி எல்லை மற்றும் சுவீகரிக்கப்படாமைச் சான்றிதழ்களுக்கான வழிகாட்டலைக் காண்க.
Prepare for conformity certificate applications.|අනුකූලතා සහතික අයදුම්පත් සඳහා සූදානම් වන්න.|இணக்கச் சான்றிதழ் விண்ணப்பங்களுக்குத் தயாராகவும்.
Request help or find service guidance for waste collection.|කසළ එකතු කිරීම පිළිබඳ සහාය හෝ සේවා මාර්ගෝපදේශ ලබාගන්න.|கழிவு சேகரிப்புக்கான உதவி அல்லது சேவை வழிகாட்டலைப் பெறுக.
Service transparency and accountable public information|විනිවිදභාවයෙන් යුත් සේවා හා වගකීම් සහගත මහජන තොරතුරු|வெளிப்படையான சேவைகளும் பொறுப்புள்ள பொதுத் தகவல்களும்
Resident support and inclusive local communication|නේවාසික සහාය හා සියලු දෙනා සම්බන්ධ කරගත් දේශීය සන්නිවේදනය|குடியிருப்பாளர் உதவியும் அனைவரையும் உள்ளடக்கிய உள்ளூர் தொடர்பாடலும்
Planning decisions pending official council content|සැලසුම් තීරණ පිළිබඳ නිල සභා තොරතුරු ලැබීමට ඇත|திட்டமிடல் முடிவுகள் குறித்த அதிகாரப்பூர்வச் சபைத் தகவல்கள் நிலுவையில் உள்ளன
Masks, movement, craft and community festivals are presented as living culture, with final heritage copy pending.|වෙස්මුහුණු, රංග කලාව, ශිල්ප කලාව හා ප්‍රජා උත්සව සජීවී සංස්කෘතිය ලෙස ඉදිරිපත් කෙරේ. අවසන් උරුම විස්තර තහවුරු කිරීමට ඇත.|முகமூடிகள், நடனம், கைவினை மற்றும் சமூக விழாக்கள் வாழும் கலாசாரமாக வழங்கப்படுகின்றன. இறுதி மரபுரிமை விவரங்கள் நிலுவையில் உள்ளன.
Food, craft and community connect public life to the identity of Dambulla.|ආහාර, ශිල්ප කලාව හා ප්‍රජාව දඹුල්ලේ අනන්‍යතාව සමඟ ජන ජීවිතය බැඳ තබයි.|உணவு, கைவினை மற்றும் சமூகம் பொதுவாழ்வைத் தம்புள்ளையின் அடையாளத்துடன் இணைக்கின்றன.
A monumental rock fortress landscape of gardens, frescoes, stone, water and royal memory.|උද්‍යාන, බිතුසිතුවම්, ශිලා නිර්මාණ, ජලය හා රාජකීය මතකයන්ගෙන් සමන්විත විශිෂ්ට පර්වත බලකොටුවක්.|தோட்டங்கள், சுவரோவியங்கள், கல், நீர் மற்றும் அரச நினைவுகளைக் கொண்ட பிரமாண்டப் பாறைக் கோட்டை.
A quieter archaeological landscape near Sigiriya, presented with final facts pending official review.|සීගිරිය අසල නිහඬ පුරාවිද්‍යා භූමියකි. අවසන් තොරතුරු නිල සමාලෝචනයට යටත්ය.|சீகிரியாவிற்கு அருகிலுள்ள அமைதியான தொல்லியல் நிலப்பரப்பு. இறுதித் தகவல்கள் அதிகாரப்பூர்வ ஆய்வுக்கு உட்பட்டவை.
A forested historic setting associated with Kandalama, suited to a slower documentary treatment.|කණ්ඩලම හා සම්බන්ධ, සන්සුන්ව හඳුනාගත හැකි වනාන්තරගත ඓතිහාසික පරිසරයකි.|கண்டலமவுடன் தொடர்புடைய, அமைதியாக அறிந்துகொள்ளக்கூடிய வனம்சூழ்ந்த வரலாற்றுச் சூழல்.
A landscape of water, vegetation and horizon that opens the tourism portion after the civic service area.|ජලය, හරිත පරිසරය හා ඈත දසුන් එක්වන මෙම භූමිය මහජන සේවා අංශයෙන් පසු සංචාරක අංශයට පිවිසුම සපයයි.|நீர், பசுமை மற்றும் தொலைதூரக் காட்சிகள் இணையும் இந்நிலப்பரப்பு பொதுச் சேவைப் பகுதிக்குப் பின் சுற்றுலாப் பகுதிக்கான நுழைவாக அமைகிறது.
The website presents local identity, public service and cultural importance together, while keeping official facts pending until council confirmation.|දේශීය අනන්‍යතාව, මහජන සේවය හා සංස්කෘතික වැදගත්කම මෙම වෙබ් අඩවියෙන් එක්ව ඉදිරිපත් කෙරේ. නිල තොරතුරු සභාවේ තහවුරු කිරීමෙන් පසු පළ කෙරේ.|உள்ளூர் அடையாளம், பொதுச் சேவை மற்றும் கலாசார முக்கியத்துவத்தை இத்தளம் ஒன்றாக வழங்குகிறது. அதிகாரப்பூர்வத் தகவல்கள் சபையின் உறுதிப்படுத்தலுக்குப் பின் வெளியிடப்படும்.
The Chairman's official message will be published after council confirmation.|සභාවේ තහවුරු කිරීමෙන් පසු සභාපතිතුමාගේ නිල පණිවිඩය පළ කෙරේ.|சபையின் உறுதிப்படுத்தலுக்குப் பின் தவிசாளரின் அதிகாரப்பூர்வச் செய்தி வெளியிடப்படும்.
The Secretary's official message will be published after council confirmation.|සභාවේ තහවුරු කිරීමෙන් පසු ලේකම්තුමියගේ නිල පණිවිඩය පළ කෙරේ.|சபையின் உறுதிப்படுத்தலுக்குப் பின் செயலாளரின் அதிகாரப்பூர்வச் செய்தி வெளியிடப்படும்.
This prototype marks a future online service area and does not collect information or process requests.|මෙය ඉදිරියේදී ලබාදීමට නියමිත මාර්ගගත සේවාවක ආදර්ශයකි. තොරතුරු රැස් කිරීමක් හෝ ඉල්ලීම් සැකසීමක් සිදු නොවේ.|இது எதிர்கால இணையவழிச் சேவைக்கான முன்மாதிரி. தகவல்கள் சேகரிக்கப்படுவதோ கோரிக்கைகள் செயலாக்கப்படுவதோ இல்லை.
Council services, local information and unforgettable places, all from one trusted gateway.|සභා සේවා, ප්‍රාදේශීය තොරතුරු හා මතකයේ රැඳෙන ස්ථාන වෙත එකම විශ්වාසනීය පිවිසුමක්.|சபைச் சேவைகள், உள்ளூர் தகவல்கள் மற்றும் மறக்கமுடியாத இடங்களுக்கு ஒரே நம்பகமான நுழைவாயில்.
Find council services, applications and information quickly. Unverified fees and files remain clearly marked.|සභා සේවා, අයදුම්පත් හා තොරතුරු ඉක්මනින් සොයාගන්න. තහවුරු නොකළ ගාස්තු හා ගොනු පැහැදිලිව සලකුණු කර ඇත.|சபைச் சேவைகள், விண்ணப்பங்கள் மற்றும் தகவல்களை விரைவாகக் கண்டறிக. உறுதிப்படுத்தப்படாத கட்டணங்களும் கோப்புகளும் தெளிவாகக் குறிக்கப்பட்டுள்ளன.
Official notice content, dates and source references will appear here after final council confirmation.|සභාවේ අවසන් තහවුරු කිරීමෙන් පසු නිල නිවේදන, දින හා මූලාශ්‍ර මෙහි පළ කෙරේ.|சபையின் இறுதி உறுதிப்படுத்தலுக்குப் பின் அதிகாரப்பூர்வ அறிவிப்புகள், திகதிகள் மற்றும் மூலக் குறிப்புகள் இங்கு வெளியிடப்படும்.
Final council wording will be added after official confirmation.|නිල තහවුරු කිරීමෙන් පසු සභාවේ අවසන් ප්‍රකාශය එක් කෙරේ.|அதிகாரப்பூர்வ உறுதிப்படுத்தலுக்குப் பின் சபையின் இறுதி உரை சேர்க்கப்படும்.
Official vision statement pending final council content.|සභාවේ නිල දැක්ම පිළිබඳ අවසන් ප්‍රකාශය ලැබීමට ඇත.|சபையின் அதிகாரப்பூர்வத் தூரநோக்கு அறிக்கை நிலுவையில் உள்ளது.
Official mission statement pending final council content.|සභාවේ නිල මෙහෙවර පිළිබඳ අවසන් ප්‍රකාශය ලැබීමට ඇත.|சபையின் அதிகாரப்பூர்வப் பணிக்கூற்று அறிக்கை நிலுவையில் உள்ளது.
Real council/community photography is used where available. Programme details and dates remain pending official confirmation.|ලබාදී ඇති සැබෑ සභා හා ප්‍රජා ඡායාරූප භාවිත කර ඇත. වැඩසටහන් විස්තර හා දින නිල වශයෙන් තහවුරු කිරීමට ඇත.|கிடைக்கப்பெற்ற உண்மையான சபை மற்றும் சமூகப் புகைப்படங்கள் பயன்படுத்தப்பட்டுள்ளன. நிகழ்ச்சி விவரங்களும் திகதிகளும் அதிகாரப்பூர்வமாக உறுதிப்படுத்தப்பட வேண்டும்.
Human craft stories add warmth without replacing the public-service purpose of the website.|ශිල්පීන්ගේ කතා, වෙබ් අඩවියේ මහජන සේවා අරමුණ සුරකිමින්, එයට මානුෂීය අගයක් එක් කරයි.|கைவினைஞர்களின் கதைகள் தளத்தின் பொதுச் சேவை நோக்கத்தைப் பேணியபடி மனிதநேயத்தைச் சேர்க்கின்றன.
Heritage and destination content remains secondary to civic services while giving visitors a clear gateway into the region.|මහජන සේවාවලට ප්‍රමුඛත්වය දෙමින්, උරුමය හා සංචාරක ස්ථාන පිළිබඳ තොරතුරු ප්‍රදේශය හඳුනාගැනීමට මඟ පෙන්වයි.|பொதுச் சேவைகளுக்கு முன்னுரிமை அளித்தபடி மரபுரிமை மற்றும் சுற்றுலாத் தகவல்கள் பிரதேசத்தை அறிய வழிகாட்டுகின்றன.
Destination content is presented with care and final visitor guidance can be added after official review.|සංචාරක ස්ථාන පිළිබඳ තොරතුරු සැලකිල්ලෙන් ඉදිරිපත් කෙරේ. අවසන් සංචාරක උපදෙස් නිල සමාලෝචනයෙන් පසු එක් කෙරේ.|சுற்றுலாத் தகவல்கள் கவனத்துடன் வழங்கப்படுகின்றன. இறுதிப் பார்வையாளர் வழிகாட்டல் அதிகாரப்பூர்வ ஆய்வுக்குப் பின் சேர்க்கப்படும்.
Future council charges and selected fees can be represented here when providers and receipt rules are confirmed.|සේවා සපයන්නන් හා රිසිට්පත් නීති තහවුරු වූ පසු සභා ගාස්තු ගෙවීම් මෙහි හඳුන්වා දිය හැක.|சேவை வழங்குநர்களும் பற்றுச்சீட்டு விதிகளும் உறுதிப்படுத்தப்பட்ட பின் சபைக் கட்டணக் கொடுப்பனவுகள் இங்கு அறிமுகப்படுத்தப்படலாம்.
Future access to selected facilities, appointments and visitor services can be represented here.|තෝරාගත් පහසුකම්, හමුවීම් හා සංචාරක සේවා වෙන්කර ගැනීම ඉදිරියේදී මෙහි හඳුන්වා දිය හැක.|தேர்ந்தெடுக்கப்பட்ட வசதிகள், சந்திப்புகள் மற்றும் பார்வையாளர் சேவைகளுக்கான முன்பதிவுகள் எதிர்காலத்தில் இங்கு அறிமுகப்படுத்தப்படலாம்.
Contact details and office hours remain reserved for final verification before official publication.|සම්බන්ධතා විස්තර හා කාර්යාල වේලාවන් නිල වශයෙන් පළ කිරීමට පෙර අවසන් තහවුරු කිරීම අවශ්‍යය.|தொடர்பு விவரங்களும் அலுவலக நேரமும் அதிகாரப்பூர்வ வெளியீட்டிற்கு முன் இறுதியாக உறுதிப்படுத்தப்பட வேண்டும்.
Gateway to Dambulla & Sigiriya. Official contact details pending final verification.|දඹුල්ල හා සීගිරිය වෙත පිවිසුම. නිල සම්බන්ධතා විස්තර අවසන් තහවුරු කිරීම සඳහා අපේක්ෂිතයි.|தம்புள்ளை மற்றும் சீகிரியாவிற்கான நுழைவாயில். அதிகாரப்பூர்வத் தொடர்பு விவரங்கள் இறுதி உறுதிப்படுத்தலுக்காக நிலுவையில் உள்ளன.
Assessment rates, council levies, certificates, and related resident support.|වරිපනම්, සභා අයකිරීම්, සහතික හා අදාළ නේවාසික සහාය.|மதிப்பீட்டு வரிகள், சபை அறவீடுகள், சான்றிதழ்கள் மற்றும் தொடர்புடைய குடியிருப்பாளர் உதவி.
Use this pathway for assessment-related questions, payment guidance, and council revenue support.|වරිපනම් ප්‍රශ්න, ගෙවීම් මාර්ගෝපදේශ හා සභා ආදායම් සේවා සහාය සඳහා මෙම පිවිසුම භාවිත කරන්න.|மதிப்பீட்டு வரிக் கேள்விகள், கொடுப்பனவு வழிகாட்டல் மற்றும் சபை வருமானச் சேவை உதவிக்கு இவ்வழியைப் பயன்படுத்தவும்.
Online payment is marked as a future service until the council confirms payment providers, fees, and receipt rules.|ගෙවීම් සපයන්නන්, ගාස්තු හා රිසිට්පත් නීති සභාව තහවුරු කරන තෙක් මාර්ගගත ගෙවීම් ඉදිරි සේවාවක් ලෙස දක්වා ඇත.|சபை கொடுப்பனவு வழங்குநர்கள், கட்டணங்கள் மற்றும் பற்றுச்சீட்டு விதிகளை உறுதிப்படுத்தும் வரை இணையவழிக் கொடுப்பனவு எதிர்காலச் சேவையாகக் குறிக்கப்பட்டுள்ளது.
Applications and renewals for local businesses operating within the council area.|සභා බල ප්‍රදේශයේ ක්‍රියාත්මක වන ව්‍යාපාර සඳහා අයදුම්පත් හා අලුත් කිරීම්.|சபைப் பிரதேசத்தில் இயங்கும் உள்ளூர் வணிகங்களுக்கான விண்ணப்பங்களும் புதுப்பித்தல்களும்.
The source material describes business licensing requirements and renewal steps.|මූලාශ්‍ර ලේඛනවල ව්‍යාපාර බලපත්‍ර අවශ්‍යතා හා අලුත් කිරීමේ පියවර විස්තර කර ඇත.|மூல ஆவணங்கள் வணிக உரிமத் தேவைகளையும் புதுப்பித்தல் படிகளையும் விவரிக்கின்றன.
Fee values and effective dates must be verified before this page is used as an official fee schedule.|මෙම පිටුව නිල ගාස්තු ලැයිස්තුවක් ලෙස භාවිත කිරීමට පෙර ගාස්තු හා ක්‍රියාත්මක වන දින තහවුරු කළ යුතුය.|இப்பக்கம் அதிகாரப்பூர்வக் கட்டணப் பட்டியலாகப் பயன்படுத்தப்படுவதற்கு முன் கட்டணங்களும் அமுலாகும் திகதிகளும் உறுதிப்படுத்தப்பட வேண்டும்.
Planning, development, and permit application guidance for residents and businesses.|නේවාසිකයන් හා ව්‍යාපාර සඳහා සැලසුම්, සංවර්ධන හා බලපත්‍ර අයදුම් මාර්ගෝපදේශ.|குடியிருப்பாளர்களுக்கும் வணிகங்களுக்கும் திட்டமிடல், அபிவிருத்தி மற்றும் அனுமதி விண்ணப்ப வழிகாட்டல்.
Supports visitors who need to understand how to begin a building or development request.|ගොඩනැගිලි හෝ සංවර්ධන ඉල්ලීමක් ආරම්භ කරන ආකාරය දැනගැනීමට අවශ්‍ය අයට සහාය සපයයි.|கட்டட அல்லது அபிவிருத்திக் கோரிக்கையைத் தொடங்குவது எப்படி என்பதை அறிய விரும்புவோருக்கு உதவுகிறது.
Final checklists should be connected to approved forms when PDF files are supplied.|PDF ගොනු ලැබුණු පසු අවසන් පිරික්සුම් ලැයිස්තු අනුමත ආකෘතිවලට සම්බන්ධ කළ යුතුය.|PDF கோப்புகள் வழங்கப்பட்ட பின் இறுதிச் சரிபார்ப்புப் பட்டியல்கள் அங்கீகரிக்கப்பட்ட படிவங்களுடன் இணைக்கப்பட வேண்டும்.
Collection information, environmental requests, and civic cleanliness services.|කසළ එකතු කිරීමේ තොරතුරු, පාරිසරික ඉල්ලීම් හා පොදු පිරිසිදුකම පිළිබඳ සේවා.|கழிவு சேகரிப்புத் தகவல்கள், சுற்றுச்சூழல் கோரிக்கைகள் மற்றும் பொதுத் தூய்மைச் சேவைகள்.
Use this service for collection questions, public cleanliness concerns, and environmental support requests.|කසළ එකතු කිරීම, පොදු පිරිසිදුකම හා පාරිසරික සහාය පිළිබඳ විමසීම් සඳහා මෙම සේවාව භාවිත කරන්න.|கழிவு சேகரிப்பு, பொதுத் தூய்மை மற்றும் சுற்றுச்சூழல் உதவிக் கோரிக்கைகளுக்கு இச்சேவையைப் பயன்படுத்தவும்.
Route-level content can be expanded once collection schedules and responsible officers are confirmed.|කසළ එකතු කිරීමේ කාලසටහන් හා වගකිවයුතු නිලධාරීන් තහවුරු වූ පසු ප්‍රදේශ අනුව විස්තර එක් කළ හැක.|சேகரிப்பு அட்டவணைகளும் பொறுப்பான அலுவலர்களும் உறுதிப்படுத்தப்பட்ட பின் பகுதிவாரியான விவரங்களைச் சேர்க்கலாம்.
A public pathway for civic issues, follow-up requests, and service feedback.|පොදු ගැටලු, පසු විපරම් ඉල්ලීම් හා සේවා ප්‍රතිචාර සඳහා මහජන පිවිසුමක්.|பொதுப் பிரச்சினைகள், பின்தொடரல் கோரிக்கைகள் மற்றும் சேவைக் கருத்துகளுக்கான பொதுமக்கள் வழி.
The prototype does not submit or store personal information.|මෙම ආදර්ශය පුද්ගලික තොරතුරු යොමු කිරීම හෝ ගබඩා කිරීම සිදු නොකරයි.|இம்முன்மாதிரி தனிப்பட்ட தகவல்களை அனுப்பவோ சேமிக்கவோ இல்லை.
A production version should include reference numbers, privacy text, and acknowledgement messaging.|සජීවී සේවාවට යොමු අංක, පෞද්ගලිකත්ව විස්තර හා ලැබුණු බව දැනුම්දීම ඇතුළත් විය යුතුය.|செயற்பாட்டு பதிப்பில் குறிப்பு இலக்கங்கள், தனியுரிமை உரை மற்றும் பெறுகை உறுதிப்படுத்தல் செய்திகள் இடம்பெற வேண்டும்.
Application form categories and document templates for public use.|මහජන භාවිතය සඳහා අයදුම්පත් වර්ග හා ලේඛන ආකෘති.|பொதுப் பயன்பாட்டிற்கான விண்ணப்ப வகைகளும் ஆவண மாதிரிகளும்.
The source document identifies the form categories, but final PDF assets were not supplied.|මූලාශ්‍ර ලේඛනයේ ආකෘති වර්ග සඳහන් වුවද අවසන් PDF ගොනු ලබාදී නැත.|மூல ஆவணம் படிவ வகைகளைக் குறிப்பிடுகிறது; இறுதி PDF கோப்புகள் வழங்கப்படவில்லை.
Download buttons remain informational until approved files are attached.|අනුමත ගොනු එක් කරන තෙක් බාගත කිරීමේ බොත්තම් තොරතුරු සඳහා පමණි.|அங்கீகரிக்கப்பட்ட கோப்புகள் இணைக்கப்படும் வரை பதிவிறக்கப் பொத்தான்கள் தகவலுக்காக மட்டுமே உள்ளன.
A documentary placeholder for official council notices while dated notices are prepared.|දින සහිත නිවේදන සකස් කරන තෙක් නිල සභා නිවේදන සඳහා වෙන් කළ ආදර්ශ සටහනකි.|திகதியிட்ட அறிவிப்புகள் தயாரிக்கப்படும் வரை அதிகாரப்பூர்வச் சபை அறிவிப்புகளுக்காக ஒதுக்கப்பட்ட முன்மாதிரிக் குறிப்பு.
Photographs supplied with the news source document for future article publication.|ඉදිරියේදී පුවත් පළ කිරීම සඳහා මූලාශ්‍ර ලේඛනය සමඟ ලබාදුන් ඡායාරූප.|எதிர்காலச் செய்தி வெளியீட்டிற்காக மூல ஆவணத்துடன் வழங்கப்பட்ட புகைப்படங்கள்.
A reserved notice area for verified service announcements, tenders, and council updates.|තහවුරු කළ සේවා නිවේදන, ටෙන්ඩර් හා සභා යාවත්කාලීන කිරීම් සඳහා වෙන් කළ අංශයකි.|உறுதிப்படுத்தப்பட்ட சேவை அறிவிப்புகள், கேள்விப்பத்திரங்கள் மற்றும் சபைப் புதுப்பிப்புகளுக்கான ஒதுக்கப்பட்ட பகுதி.
A world-renowned rock fortress and heritage landscape near Dambulla.|දඹුල්ල ආසන්නයේ පිහිටි ලෝක ප්‍රකට පර්වත බලකොටුවක් හා උරුම භූමියක්.|தம்புள்ளைக்கு அருகிலுள்ள உலகப் புகழ்பெற்ற பாறைக் கோட்டையும் மரபுரிமை நிலப்பரப்பும்.
Frescoes, mirror wall, water gardens, and the lion entrance are highlighted in the source material.|මූලාශ්‍ර තොරතුරුවල බිතුසිතුවම්, කැටපත් පවුර, ජල උද්‍යාන හා සිංහ දොරටුව විශේෂයෙන් දක්වා ඇත.|மூலத் தகவல்களில் சுவரோவியங்கள், கண்ணாடிச் சுவர், நீர்த் தோட்டங்கள் மற்றும் சிங்க நுழைவாயில் சிறப்பிக்கப்படுகின்றன.
A historically significant rock complex south of Sigiriya and near Sigiriya Wewa.|සීගිරියට දකුණින් සහ සීගිරි වැව ආසන්නයේ පිහිටි ඓතිහාසික වැදගත්කමකින් යුත් පර්වත සංකීර්ණයකි.|சீகிரியாவிற்குத் தெற்கிலும் சீகிரியா வாவிக்கு அருகிலும் அமைந்த வரலாற்று முக்கியத்துவமிக்க பாறைத் தொகுதி.
The source describes an older defensive landscape and distinctive stonework that needs final verification.|පැරණි ආරක්ෂක භූමියක් හා සුවිශේෂී ශිලා නිර්මාණ මූලාශ්‍රයේ විස්තර කර ඇත. අවසන් තහවුරු කිරීම අවශ්‍යය.|பழைய பாதுகாப்பு நிலப்பரப்பும் தனித்துவமான கல் கட்டுமானங்களும் மூலத்தில் விவரிக்கப்பட்டுள்ளன. இறுதி உறுதிப்படுத்தல் தேவை.
A quiet archaeological and forest setting associated with Kandalama.|කණ්ඩලම හා සම්බන්ධ නිහඬ පුරාවිද්‍යා හා වනාන්තර පරිසරයකි.|கண்டலமவுடன் தொடர்புடைய அமைதியான தொல்லியல் மற்றும் வனச் சூழல்.
Visitor information such as opening times and responsible authority should be confirmed before launch.|විවෘත වේලාවන් හා වගකිවයුතු ආයතනය ඇතුළු සංචාරක තොරතුරු ප්‍රකාශයට පෙර තහවුරු කළ යුතුය.|திறந்திருக்கும் நேரம் மற்றும் பொறுப்பான நிறுவனம் போன்ற பார்வையாளர் தகவல்கள் வெளியீட்டிற்கு முன் உறுதிப்படுத்தப்பட வேண்டும்.
A sacred cave-temple landscape central to the cultural identity of Dambulla.|දඹුල්ලේ සංස්කෘතික අනන්‍යතාවයේ කේන්ද්‍රස්ථානයක් වන පූජනීය ලෙන් විහාර පරිසරයකි.|தம்புள்ளையின் கலாசார அடையாளத்தின் மையமாக விளங்கும் புனிதக் குகைக் கோயில் நிலப்பரப்பு.
Historical and religious descriptions are available in the source draft, with dates pending review.|ඉතිහාසය හා ආගමික තොරතුරු මූලාශ්‍ර කෙටුම්පතේ ඇත. දින වකවානු සමාලෝචනය කිරීමට ඇත.|வரலாற்று மற்றும் சமய விவரங்கள் மூல வரைவில் உள்ளன. திகதிகள் ஆய்வுக்காக நிலுவையில் உள்ளன.
Area values conflict across supplied drafts.|ලබාදුන් කෙටුම්පත්වල භූමි ප්‍රමාණයන් එකිනෙකට නොගැළපේ.|வழங்கப்பட்ட வரைவுகளில் நிலப்பரப்பு அளவுகள் முரண்படுகின்றன.
Administrative division dates and totals need a dated official reference.|පරිපාලන කොට්ඨාස දින හා සංඛ්‍යා සඳහා දිනය සහිත නිල මූලාශ්‍රයක් අවශ්‍යය.|நிர்வாகப் பிரிவுகளின் திகதிகளுக்கும் எண்ணிக்கைகளுக்கும் திகதியிட்ட அதிகாரப்பூர்வ ஆதாரம் தேவை.
Officeholder names, photographs, fees, and service hours need final confirmation.|නිලධාරීන්ගේ නම්, ඡායාරූප, ගාස්තු හා සේවා වේලාවන් අවසන් වශයෙන් තහවුරු කළ යුතුය.|பதவியாளர்களின் பெயர்கள், புகைப்படங்கள், கட்டணங்கள் மற்றும் சேவை நேரங்கள் இறுதியாக உறுதிப்படுத்தப்பட வேண்டும்.
Tourism opening times, fees, and responsible authorities were not supplied.|සංචාරක ස්ථාන විවෘත කරන වේලාවන්, ගාස්තු හා වගකිවයුතු ආයතන පිළිබඳ තොරතුරු ලබාදී නැත.|சுற்றுலாத் தலங்களின் திறந்திருக்கும் நேரம், கட்டணங்கள் மற்றும் பொறுப்பான நிறுவனங்கள் பற்றிய தகவல்கள் வழங்கப்படவில்லை.
Dambulla Pradeshiya Sabha serves communities across a culturally significant landscape of villages, heritage places, agricultural land, and visitor destinations.|ගම්මාන, උරුම ස්ථාන, ගොවිබිම් හා සංචාරක ස්ථාන එක්වන සංස්කෘතික වටිනාකමක් ඇති ප්‍රදේශයක ප්‍රජාවට දඹුල්ල ප්‍රාදේශීය සභාව සේවය කරයි.|கிராமங்கள், மரபுரிமைத் தலங்கள், விவசாய நிலங்கள் மற்றும் சுற்றுலாத் தலங்கள் நிறைந்த கலாசார முக்கியத்துவமிக்க பிரதேச மக்களுக்குத் தம்புள்ளை பிரதேச சபை சேவையாற்றுகிறது.
The draft source material frames the council around public service, accountable administration, community wellbeing, and sustainable development.|මූලාශ්‍ර කෙටුම්පත සභාව මහජන සේවය, වගකීම් සහගත පරිපාලනය, ප්‍රජා සුබසාධනය හා තිරසාර සංවර්ධනය මත පදනම් කර දක්වයි.|மூல வரைவு சபையைப் பொதுச் சேவை, பொறுப்பான நிர்வாகம், சமூக நலன் மற்றும் நிலையான அபிவிருத்தியை மையமாகக் கொண்டு விவரிக்கிறது.
This prototype presents the council as a clear service gateway for residents, businesses, visitors, and institutions that need reliable information.|විශ්වාසනීය තොරතුරු අවශ්‍ය නේවාසිකයන්, ව්‍යාපාර, සංචාරකයන් හා ආයතන සඳහා පැහැදිලි සේවා පිවිසුමක් ලෙස මෙම ආදර්ශය සභාව හඳුන්වා දෙයි.|நம்பகமான தகவல்களை நாடும் குடியிருப்பாளர்கள், வணிகங்கள், பார்வையாளர்கள் மற்றும் நிறுவனங்களுக்கான தெளிவான சேவை நுழைவாயிலாக இம்முன்மாதிரி சபையை வழங்குகிறது.
The prototype uses keyboard-accessible navigation, visible focus styles, responsive layouts, and reduced-motion support.|මෙම ආදර්ශයට යතුරුපුවරුවෙන් සංචාලනය, පැහැදිලි focus සලකුණු, තිරයට ගැළපෙන සැලසුම හා අඩු චලන සහාය ඇතුළත්ය.|இம்முன்மாதிரியில் விசைப்பலகை வழிசெலுத்தல், தெளிவான கவனக்குறிகள், திரைக்கேற்ற அமைப்புகள் மற்றும் குறைந்த அசைவு ஆதரவு உள்ளன.
This prototype can reserve a future complaint intake workflow without collecting personal data.|පුද්ගලික දත්ත රැස් නොකර ඉදිරි පැමිණිලි භාරගැනීමේ සේවාවක් සඳහා මෙම ආදර්ශයෙන් ඉඩ වෙන් කර ඇත.|தனிப்பட்ட தரவுகளைச் சேகரிக்காமல் எதிர்கால முறைப்பாடு பெறும் சேவைக்காக இம்முன்மாதிரி இடமளிக்கிறது.
Reference numbers, privacy notices, and officer routing should be added before production use.|සජීවී භාවිතයට පෙර යොමු අංක, පෞද්ගලිකත්ව නිවේදන හා නිලධාරීන් වෙත යොමු කිරීම එක් කළ යුතුය.|செயற்பாட்டுப் பயன்பாட்டிற்கு முன் குறிப்பு இலக்கங்கள், தனியுரிமை அறிவிப்புகள் மற்றும் அலுவலர் வழிப்படுத்தல் சேர்க்கப்பட வேண்டும்.
Use the contact details after final confirmation, or route enquiries through the council office.|අවසන් තහවුරු කිරීමෙන් පසු සම්බන්ධතා විස්තර භාවිත කරන්න. විමසීම් සභා කාර්යාලයට යොමු කළ හැක.|இறுதி உறுதிப்படுத்தலுக்குப் பின் தொடர்பு விவரங்களைப் பயன்படுத்தவும். விசாரணைகளைச் சபை அலுவலகத்தின் ஊடாக மேற்கொள்ளலாம்.
Approved PDFs are pending. The current list reflects the categories identified in the supplied source.|අනුමත PDF ගොනු ලැබීමට ඇත. දැනට ඇති ලැයිස්තුව ලබාදුන් මූලාශ්‍රයේ සඳහන් වර්ග අනුව සකස් කර ඇත.|அங்கீகரிக்கப்பட்ட PDF கோப்புகள் நிலுவையில் உள்ளன. தற்போதைய பட்டியல் வழங்கப்பட்ட மூலத்தில் குறிப்பிடப்பட்ட வகைகளைக் காட்டுகிறது.
Images extracted from the supplied source documents and existing project assets.|ලබාදුන් මූලාශ්‍ර ලේඛන හා ව්‍යාපෘති රූපවලින් තෝරාගත් ඡායාරූප.|வழங்கப்பட்ட மூல ஆவணங்கள் மற்றும் திட்ட வளங்களிலிருந்து தேர்ந்தெடுக்கப்பட்ட படங்கள்.
Latest dated council notices can be added here once approved text and publication dates are supplied.|අනුමත පෙළ හා ප්‍රකාශන දින ලැබුණු පසු නවතම සභා නිවේදන මෙහි පළ කළ හැක.|அங்கீகரிக்கப்பட்ட உரையும் வெளியீட்டுத் திகதிகளும் கிடைத்த பின் அண்மைய சபை அறிவிப்புகளை இங்கு சேர்க்கலாம்.
This prototype does not submit forms, store personal information, or process payments.|මෙම ආදර්ශය ආකෘති යොමු කිරීම, පුද්ගලික තොරතුරු ගබඩා කිරීම හෝ ගෙවීම් සැකසීම සිදු නොකරයි.|இம்முன்மாதிரி படிவங்களை அனுப்பவோ தனிப்பட்ட தகவல்களைச் சேமிக்கவோ கொடுப்பனவுகளைச் செயலாக்கவோ இல்லை.
Find the right service pathway before visiting or contacting the council office.|සභා කාර්යාලයට පැමිණීමට හෝ ඇමතීමට පෙර සුදුසු සේවාව හඳුනාගන්න.|சபை அலுவலகத்திற்குச் செல்லும் அல்லது தொடர்புகொள்ளும் முன் பொருத்தமான சேவையைக் கண்டறிக.
Discover places named in the source material, with operational details reserved for official review.|මූලාශ්‍රයේ සඳහන් ස්ථාන හඳුනාගන්න. මෙහෙයුම් විස්තර නිල සමාලෝචනය සඳහා වෙන් කර ඇත.|மூலத்தில் குறிப்பிடப்பட்ட இடங்களைக் கண்டறிக. செயற்பாட்டு விவரங்கள் அதிகாரப்பூர்வ ஆய்வுக்காக ஒதுக்கப்பட்டுள்ளன.
`.trim().split('\n').map((line) => {
  const [key, sinhala, tamil] = line.split('|');
  return [key, [sinhala, tamil]];
});

Object.assign(translations, Object.fromEntries(descriptions));

Object.assign(translations, {
  'Back to council': ['??? ??????? ??? ????', '????????? ????????'],
  'Official photograph': ['??????????? ????????', '??????????? ??????????'],
  'Official details': ['??????????? ??????', '??????????? ?????????'],
  'Official message': ['??????????? ???????', '??????????? ??????'],
});
