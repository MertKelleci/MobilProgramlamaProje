/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
// import type {Node} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  DrawerLayoutAndroid,
  Pressable,
  ImageBackground,
  TextInput,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import UserCard from './android/app/src/components/UserCard';
import RNPickerSelect from 'react-native-picker-select';

const Stack = createNativeStackNavigator();

const AnaEkran = ({navigation}) => {
  return (
    <View style={Stil.AnaEkranView}>
      <ImageBackground
        source={require('./images/AnaEkranResim3.jpg')}
        resizeMode="cover"
        style={Stil.AnaEkranResim}>
        <Text style={Stil.AnaEkranBaslik}>Group UP!</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('KayitEkrani');
          }}
          style={Stil.AnaEkranButon}>
          <Text>Kayıt Ol</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('GirisEkrani');
          }}
          style={Stil.AnaEkranButon}>
          <Text>Giriş</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

const KayitEkrani = ({navigation}) => {
  const [kAdi, setkAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [tel, setTel] = useState('');
  const [ad, setAd] = useState('');
  const [uri, setUri] = useState('');
  const [gorunurluk, gorunurlukAyarla] = useState(false);

  async function kayitOl() {
    let mevcutmu = false;
    const kullanicilar = firestore().collection('kullanicilar');

    kullanicilar
      .where('kullaniciAdi', '==', kAdi)
      .get()
      .then(query => {
        if (!query.empty) {
          mevcutmu = true;
          alert('Bu kullanıcı adı zaten alınmış!');
        }

        kullanicilar
          .where('telefonNo', '==', tel)
          .get()
          .then(query => {
            if (!query.empty) {
              mevcutmu = true;
              alert('Bu telefon numarası zaten alınmış!');
            }

            if (!mevcutmu) {
              const resimRef = storage().ref('kullaniciResimleri/' + kAdi);

              const task = resimRef.putFile(uri);

              task.then(async () => {
                let fotoUrl = await resimRef.getDownloadURL();

                kullanicilar
                  .doc(kAdi)
                  .set({
                    kullaniciAdi: kAdi,
                    sifre: sifre,
                    telefonNo: tel,
                    ad: ad,
                    fotoUrl: fotoUrl,
                  })
                  .then(() => {
                    ToastAndroid.show(
                      'Kayıt Oluşturma Başarılı.',
                      ToastAndroid.SHORT,
                    );
                    navigation.navigate('GirisEkrani');
                  });
              });
            }
          });
      });
  }

  function fotografCek() {
    const fotoAyari = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchCamera(fotoAyari, resim => {
      setUri(resim.assets[0].uri);
      gorunurlukAyarla(true);
    });
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={Stil.KayitEkraniView}>
        <Text style={Stil.KullaniciInputHeader}>Kullanıcı Adı</Text>
        <TextInput
          onChangeText={text => setkAdi(text)}
          style={Stil.KayitEkraniTextInput}
          placeholder="Kullanıcı Adı"
        />
        <Text style={Stil.KullaniciInputHeader}>Şifre</Text>
        <TextInput
          onChangeText={text => setSifre(text)}
          style={Stil.KayitEkraniTextInput}
          placeholder="Şifre"
        />
        <Text style={Stil.KullaniciInputHeader}>Telefon Numarası</Text>
        <TextInput
          onChangeText={text => setTel(text)}
          style={Stil.KayitEkraniTextInput}
          placeholder="Telefon Numarası"
        />
        <Text style={Stil.KullaniciInputHeader}>Ad</Text>
        <TextInput
          onChangeText={text => setAd(text)}
          style={Stil.KayitEkraniTextInput}
          placeholder="Ad"
        />
        {!gorunurluk && (
          <TouchableOpacity
            onPress={() => {
              fotografCek();
            }}
            style={Stil.KayitEkraniButon}>
            <Text>Fotoğraf Ekle</Text>
          </TouchableOpacity>
        )}
        {gorunurluk && (
          <TouchableOpacity
            onPress={() => {
              kayitOl();
            }}
            style={Stil.KayitEkraniButon}>
            <Text>Kaydı Tamamla</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const GirisEkrani = ({navigation}) => {
  const [kAdi, setkAdi] = useState('');
  const [sifre, setSifre] = useState('');
  function giris() {
    const kullanicilar = firestore().collection('kullanicilar');

    kullanicilar
      .where('kullaniciAdi', '==', kAdi)
      .where('sifre', '==', sifre)
      .get()
      .then(query => {
        if (!query.empty) {
          ToastAndroid.show('Giriş Başarılı.', ToastAndroid.SHORT);
          navigation.navigate('Main', {kullanici: query.docs[0].data()});
        } else {
          alert('Böyle bir kullanıcı yok!');
        }
      });
  }

  return (
    <View style={Stil.KayitEkraniView}>
      <Text style={Stil.KullaniciInputHeader}>Kullanıcı Adı</Text>
      <TextInput
        onChangeText={newText => setkAdi(newText)}
        style={Stil.GirisEkraniTextInput}
        placeholder="Kullanıcı Adı"
      />
      <Text style={Stil.KullaniciInputHeader}>Şifre</Text>
      <TextInput
        onChangeText={newText => setSifre(newText)}
        style={Stil.GirisEkraniTextInput}
        placeholder="Şifre"
      />
      <TouchableOpacity
        onPress={() => {
          giris();
        }}
        style={Stil.GirisEkraniButon}>
        <Text>Giriş!</Text>
      </TouchableOpacity>
    </View>
  );
};

const Main = function ({route, navigation}) {
  const mevcutKullanici = route.params.kullanici;
  const [arananSehir, setArananSehir] = useState('');
  const [arananTur, setArananTur] = useState('');

  let etkinlikler = [];

  const aktiviteler = firestore().collection('aktiviteler');

  function aktiviteAra() {
    aktiviteler
      .where('sehir', '==', arananSehir)
      .where('etkinlikTuru', '==', arananTur)
      .where('yaraticiKullaniciAdi', '!=', mevcutKullanici.kullaniciAdi)
      .get()
      .then(query => {
        query.forEach(doc => {
          etkinlikler.push(doc.data());
        });

        navigation.navigate('aktiviteAramaSonucEkrani', {
          arananEtkinlikler: etkinlikler,
          mevcutKullanici: mevcutKullanici,
        });
        etkinlikler = [];
      });
  }

  function olusturulanEtkinlikler() {
    aktiviteler
      .where('yaraticiKullaniciAdi', '==', mevcutKullanici.kullaniciAdi)
      .get()
      .then(query => {
        query.forEach(doc => {
          etkinlikler.push(doc.data());
        });

        navigation.navigate('olusturdugumEtkinliklerEkrani', {
          olusturulanEtkinlikler: etkinlikler,
        });

        etkinlikler = [];
      });
  }

  function katildigimEtkinlikler() {
    aktiviteler
      .where(
        'katilimcilarKullaniciAdi',
        'array-contains',
        mevcutKullanici.kullaniciAdi,
      )
      .get()
      .then(query => {
        query.forEach(doc => {
          etkinlikler.push(doc.data());
          // console.log(doc.data());
        });

        navigation.navigate('katildigimEtkinliklerEkrani', {
          katildigimEtkinlikler: etkinlikler,
        });

        etkinlikler = [];
      });
  }

  const navigationView = function () {
    return (
      <View style={{alignItems: 'center'}}>
        <UserCard
          kullaniciAdi={mevcutKullanici.kullaniciAdi}
          fotoUrl={mevcutKullanici.fotoUrl}
        />
        <Pressable
          onPress={() => {
            navigation.navigate('EklemeEkrani', {
              mevcutKullanici: mevcutKullanici,
            });
          }}
          style={Stil.button}>
          <Text style={{fontSize: 15, color: '#222831'}}>
            Yeni Etkinlik Oluştur
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            olusturulanEtkinlikler();
          }}
          style={Stil.button}>
          <Text style={{fontSize: 15, color: '#222831'}}>
            Oluşturduğum etkinlikler
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            katildigimEtkinlikler();
          }}
          style={Stil.button}>
          <Text style={{fontSize: 15, color: '#222831'}}>
            Katıldığım etkinlikler
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <DrawerLayoutAndroid
      drawerWidth={300}
      renderNavigationView={navigationView}>
      <View style={Stil.searchArea}>
        <View style={Stil.pickerCard}>
          <Text style={Stil.pickerText}>Şehir</Text>
          <View style={Stil.RNPicker}>
            <RNPickerSelect
              onValueChange={value => {
                setArananSehir(value);
              }}
              items={[
                {label: 'Adana', value: 'Adana'},
                {label: 'Adıyaman', value: 'Adıyaman'},
                {label: 'Afyonkarahisar', value: 'Afyonkarahisar'},
                {label: 'Ağrı', value: 'Ağrı'},
                {label: 'Aksaray', value: 'Aksaray'},
                {label: 'Amasya', value: 'Amasya'},
                {label: 'Ankara', value: 'Ankara'},
                {label: 'Antalya', value: 'Antalya'},
                {label: 'Ardahan', value: 'Ardahan'},
                {label: 'Artvin', value: 'Artvin'},
                {label: 'Aydın', value: 'Aydın'},
                {label: 'Balıkesir', value: 'Balıkesir'},
                {label: 'Bartın', value: 'Bartın'},
                {label: 'Batman', value: 'Batman'},
                {label: 'Bayburt', value: 'Bayburt'},
                {label: 'Bilecik', value: 'Bilecik'},
                {label: 'Bingöl', value: 'Bingöl'},
                {label: 'Bitlis', value: 'Bitlis'},
                {label: 'Bolu', value: 'Bolu'},
                {label: 'Burdur', value: 'Burdur'},
                {label: 'Bursa', value: 'Bursa'},
                {label: 'Çanakkale', value: 'Çanakkale'},
                {label: 'Çankırı', value: 'Çankırı'},
                {label: 'Çorum', value: 'Çorum'},
                {label: 'Denizli', value: 'Denizli'},
                {label: 'Diyarbakır', value: 'Diyarbakır'},
                {label: 'Düzce', value: 'Düzce'},
                {label: 'Edirne', value: 'Edirne'},
                {label: 'Elazığ', value: 'Elazığ'},
                {label: 'Erzincan', value: 'Erzincan'},
                {label: 'Erzurum', value: 'Erzurum'},
                {label: 'Eskişehir', value: 'Eskişehir'},
                {label: 'Gaziantep', value: 'Gaziantep'},
                {label: 'Giresun', value: 'Giresun'},
                {label: 'Gümüşhane', value: 'Gümüşhane'},
                {label: 'Hakkari', value: 'Hakkari'},
                {label: 'Hatay', value: 'Hatay'},
                {label: 'Iğdır', value: 'Iğdır'},
                {label: 'Isparta', value: 'Isparta'},
                {label: 'İstanbul', value: 'İstanbul'},
                {label: 'İzmir', value: 'İzmir'},
                {label: 'Kahramanmaraş', value: 'Kahramanmaraş'},
                {label: 'Karabük', value: 'Karabük'},
                {label: 'Karaman', value: 'Karaman'},
                {label: 'Kars', value: 'Kars'},
                {label: 'Kastamonu', value: 'Kastamonu'},
                {label: 'Kayseri', value: 'Kayseri'},
                {label: 'Kırıkkale', value: 'Kırıkkale'},
                {label: 'Kırklareli', value: 'Kırklareli'},
                {label: 'Kırşehir', value: 'Kırşehir'},
                {label: 'Kilis', value: 'Kilis'},
                {label: 'Kocaeli', value: 'Kocaeli'},
                {label: 'Konya', value: 'Konya'},
                {label: 'Kütahya', value: 'Kütahya'},
                {label: 'Malatya', value: 'Malatya'},
                {label: 'Manisa', value: 'Manisa'},
                {label: 'Mardin', value: 'Mardin'},
                {label: 'Mersin', value: 'Mersin'},
                {label: 'Muğla', value: 'Muğla'},
                {label: 'Muş', value: 'Muş'},
                {label: 'Nevşehir', value: 'Nevşehir'},
                {label: 'Niğde', value: 'Niğde'},
                {label: 'Ordu', value: 'Ordu'},
                {label: 'Osmaniye', value: 'Osmaniye'},
                {label: 'Rize', value: 'Rize'},
                {label: 'Sakarya', value: 'Sakarya'},
                {label: 'Samsun', value: 'Samsun'},
                {label: 'Siirt', value: 'Siirt'},
                {label: 'Sinop', value: 'Sinop'},
                {label: 'Sivas', value: 'Sivas'},
                {label: 'Şanlıurfa', value: 'Şanlıurfa'},
                {label: 'Şırnak', value: 'Şırnak'},
                {label: 'Tekirdağ', value: 'Tekirdağ'},
                {label: 'Tokat', value: 'Tokat'},
                {label: 'Trabzon', value: 'Trabzon'},
                {label: 'Tunceli', value: 'Tunceli'},
                {label: 'Uşak', value: 'Uşak'},
                {label: 'Van', value: 'Van'},
                {label: 'Yalova', value: 'Yalova'},
                {label: 'Yozgat', value: 'Yozgat'},
                {label: 'Zonguldak', value: 'Zonguldak'},
              ]}
            />
          </View>
        </View>
        <View style={Stil.pickerCard}>
          <Text style={Stil.pickerText}>Aktivite Türü</Text>
          <View style={Stil.RNPicker}>
            <RNPickerSelect
              onValueChange={value => {
                setArananTur(value);
              }}
              items={[
                {label: 'Yeme/içme', value: 'Yemek'},
                {label: 'Sportif', value: 'Sportif'},
                {label: 'Oyun', value: 'Oyun'},
                {label: 'Gezme', value: 'Gezme'},
              ]}
            />
          </View>
        </View>
        <Pressable
          onPress={() => {
            aktiviteAra();
          }}
          style={[Stil.button, {alignSelf: 'center'}]}>
          <Text>Aktivite ara</Text>
        </Pressable>
      </View>
    </DrawerLayoutAndroid>
  );
};

const EklemeEkrani = ({route, navigation}) => {
  const mevcutKullanici = route.params.mevcutKullanici;

  const [etkinlikAdi, setEtkinlikAdi] = useState('');
  const [adres, setAdres] = useState('');
  const [sehir, setSehir] = useState('');
  const [etkinlikAciklamasi, setEtinlikAciklamasi] = useState('');
  const [etkinlikTuru, setEtkinlikTuru] = useState('');

  function ekle() {
    const yeniEtkinlik = firestore().collection('aktiviteler');

    const etkinlikKey = mevcutKullanici.kullaniciAdi + '_' + etkinlikAdi;

    yeniEtkinlik
      .where('etkinlikKey', '==', etkinlikKey)
      .get()
      .then(query => {
        if (!query.empty) {
          alert('Böyle bir etkinlik zaten oluşturulmuş!');
        } else {
          yeniEtkinlik.doc(etkinlikKey).set({
            etkinlikKey: etkinlikKey,
            etkinlikAdi: etkinlikAdi,
            yaraticiAdi: mevcutKullanici.ad,
            yaraticiKullaniciAdi: mevcutKullanici.kullaniciAdi,
            yaraticiTelefonNo: mevcutKullanici.telefonNo,
            adres: adres,
            sehir: sehir,
            etkinlikAciklamasi: etkinlikAciklamasi,
            katilimcilarKullaniciAdi: katilimcilar,
            katilimcilarAd: katilimcilar,
            katilimcilarTel: katilimcilar,
            yaraticiFotoUrl: mevcutKullanici.fotoUrl,
            etkinlikTuru: etkinlikTuru,
          });

          ToastAndroid.show('Ekleme Başarılı!', ToastAndroid.SHORT);
        }
      });
  }

  return (
    <View style={Stil.searchArea}>
      <View style={Stil.pickerCard}>
        <Text style={Stil.pickerText}>Etkinliğinizin Adı:</Text>
        <View style={Stil.RNPicker}>
          <TextInput
            onChangeText={text => {
              setEtkinlikAdi(text);
            }}
            placeholder="Etkinlik Adı"
          />
        </View>
      </View>
      <View style={Stil.pickerCard}>
        <Text style={Stil.pickerText}>Adres:</Text>
        <View style={Stil.RNPicker}>
          <TextInput
            onChangeText={text => {
              setAdres(text);
            }}
            placeholder="adres"
          />
        </View>
      </View>
      <View style={Stil.pickerCard}>
        <Text style={Stil.pickerText}>Şehir</Text>
        <View style={Stil.RNPicker}>
          <RNPickerSelect
            onValueChange={value => {
              setSehir(value);
            }}
            items={[
              {label: 'Adana', value: 'Adana'},
              {label: 'Adıyaman', value: 'Adıyaman'},
              {label: 'Afyonkarahisar', value: 'Afyonkarahisar'},
              {label: 'Ağrı', value: 'Ağrı'},
              {label: 'Aksaray', value: 'Aksaray'},
              {label: 'Amasya', value: 'Amasya'},
              {label: 'Ankara', value: 'Ankara'},
              {label: 'Antalya', value: 'Antalya'},
              {label: 'Ardahan', value: 'Ardahan'},
              {label: 'Artvin', value: 'Artvin'},
              {label: 'Aydın', value: 'Aydın'},
              {label: 'Balıkesir', value: 'Balıkesir'},
              {label: 'Bartın', value: 'Bartın'},
              {label: 'Batman', value: 'Batman'},
              {label: 'Bayburt', value: 'Bayburt'},
              {label: 'Bilecik', value: 'Bilecik'},
              {label: 'Bingöl', value: 'Bingöl'},
              {label: 'Bitlis', value: 'Bitlis'},
              {label: 'Bolu', value: 'Bolu'},
              {label: 'Burdur', value: 'Burdur'},
              {label: 'Bursa', value: 'Bursa'},
              {label: 'Çanakkale', value: 'Çanakkale'},
              {label: 'Çankırı', value: 'Çankırı'},
              {label: 'Çorum', value: 'Çorum'},
              {label: 'Denizli', value: 'Denizli'},
              {label: 'Diyarbakır', value: 'Diyarbakır'},
              {label: 'Düzce', value: 'Düzce'},
              {label: 'Edirne', value: 'Edirne'},
              {label: 'Elazığ', value: 'Elazığ'},
              {label: 'Erzincan', value: 'Erzincan'},
              {label: 'Erzurum', value: 'Erzurum'},
              {label: 'Eskişehir', value: 'Eskişehir'},
              {label: 'Gaziantep', value: 'Gaziantep'},
              {label: 'Giresun', value: 'Giresun'},
              {label: 'Gümüşhane', value: 'Gümüşhane'},
              {label: 'Hakkari', value: 'Hakkari'},
              {label: 'Hatay', value: 'Hatay'},
              {label: 'Iğdır', value: 'Iğdır'},
              {label: 'Isparta', value: 'Isparta'},
              {label: 'İstanbul', value: 'İstanbul'},
              {label: 'İzmir', value: 'İzmir'},
              {label: 'Kahramanmaraş', value: 'Kahramanmaraş'},
              {label: 'Karabük', value: 'Karabük'},
              {label: 'Karaman', value: 'Karaman'},
              {label: 'Kars', value: 'Kars'},
              {label: 'Kastamonu', value: 'Kastamonu'},
              {label: 'Kayseri', value: 'Kayseri'},
              {label: 'Kırıkkale', value: 'Kırıkkale'},
              {label: 'Kırklareli', value: 'Kırklareli'},
              {label: 'Kırşehir', value: 'Kırşehir'},
              {label: 'Kilis', value: 'Kilis'},
              {label: 'Kocaeli', value: 'Kocaeli'},
              {label: 'Konya', value: 'Konya'},
              {label: 'Kütahya', value: 'Kütahya'},
              {label: 'Malatya', value: 'Malatya'},
              {label: 'Manisa', value: 'Manisa'},
              {label: 'Mardin', value: 'Mardin'},
              {label: 'Mersin', value: 'Mersin'},
              {label: 'Muğla', value: 'Muğla'},
              {label: 'Muş', value: 'Muş'},
              {label: 'Nevşehir', value: 'Nevşehir'},
              {label: 'Niğde', value: 'Niğde'},
              {label: 'Ordu', value: 'Ordu'},
              {label: 'Osmaniye', value: 'Osmaniye'},
              {label: 'Rize', value: 'Rize'},
              {label: 'Sakarya', value: 'Sakarya'},
              {label: 'Samsun', value: 'Samsun'},
              {label: 'Siirt', value: 'Siirt'},
              {label: 'Sinop', value: 'Sinop'},
              {label: 'Sivas', value: 'Sivas'},
              {label: 'Şanlıurfa', value: 'Şanlıurfa'},
              {label: 'Şırnak', value: 'Şırnak'},
              {label: 'Tekirdağ', value: 'Tekirdağ'},
              {label: 'Tokat', value: 'Tokat'},
              {label: 'Trabzon', value: 'Trabzon'},
              {label: 'Tunceli', value: 'Tunceli'},
              {label: 'Uşak', value: 'Uşak'},
              {label: 'Van', value: 'Van'},
              {label: 'Yalova', value: 'Yalova'},
              {label: 'Yozgat', value: 'Yozgat'},
              {label: 'Zonguldak', value: 'Zonguldak'},
            ]}
          />
        </View>
      </View>
      <View style={Stil.pickerCard}>
        <Text style={Stil.pickerText}>Aktivite Türü</Text>
        <View style={Stil.RNPicker}>
          <RNPickerSelect
            onValueChange={value => {
              setEtkinlikTuru(value);
            }}
            items={[
              {label: 'Yeme/içme', value: 'Yemek'},
              {label: 'Sportif', value: 'Sportif'},
              {label: 'Oyun', value: 'Oyun'},
              {label: 'Gezme', value: 'Gezme'},
            ]}
          />
        </View>
      </View>
      <View style={Stil.pickerCard}>
        <Text style={Stil.pickerText}>Etkinlik Açıklaması</Text>
        <View style={Stil.RNPicker}>
          <TextInput
            onChangeText={text => {
              setEtinlikAciklamasi(text);
            }}
            placeholder="Etkinliğiniz hakkında bilgi"
          />
        </View>
      </View>
      <Pressable
        onPress={() => {
          ekle();
        }}
        style={[Stil.button, {alignSelf: 'center'}]}>
        <Text style={{paddingTop: 10}}>Ekle!</Text>
      </Pressable>
    </View>
  );
};

const aktiviteAramaSonucEkrani = ({route, navigation}) => {
  const bulunanEtkinlikler = route.params.arananEtkinlikler;
  const mevcutKullanici = route.params.mevcutKullanici;

  function basvuru(etkinlik) {
    const aktiviteler = firestore().collection('aktiviteler');
    aktiviteler
      .where('etkinlikKey', '==', etkinlik.etkinlikKey)
      .get()
      .then(query => {
        query.forEach(doc => {
          let varmi = false;

          const mevcutEtkinlik = doc.data();

          for (
            let i = 0;
            i < mevcutEtkinlik.katilimcilarKullaniciAdi.length;
            i++
          ) {
            if (
              mevcutEtkinlik.katilimcilarKullaniciAdi[i] ==
              mevcutKullanici.kullaniciAdi
            ) {
              varmi = true;
              break;
            }
          }

          if (varmi) {
            alert('Bu etkinlikte zaten varsınız!');
          } else {
            etkinlik.katilimcilarKullaniciAdi.push(
              mevcutKullanici.kullaniciAdi,
            );

            aktiviteler
              .doc(etkinlik.etkinlikKey)
              .update({
                katilimcilarKullaniciAdi: etkinlik.katilimcilarKullaniciAdi,
              })
              .then(() => {
                ToastAndroid.show('Etkinliğe Katıldınız!', ToastAndroid.SHORT);
              });
          }
        });
      });
  }

  return (
    <ScrollView>
      {bulunanEtkinlikler.map(etkinlik => {
        return (
          <View style={[Stil.searchArea, {marginBottom: '10%'}]}>
            <Text style={Stil.pickerText}>
              Etkinlik Adı: {etkinlik.etkinlikAdi}
            </Text>
            <Text style={Stil.pickerText}>
              Etkinlik yöneticisinin adı: {etkinlik.yaraticiAdi}
            </Text>
            <Text style={Stil.pickerText}>
              Etkinlik yöneticisinin telefon numarası:{' '}
              {etkinlik.yaraticiTelefonNo}
            </Text>
            <Text style={Stil.pickerText}>Adres bilgisi: {etkinlik.adres}</Text>
            <Text style={Stil.pickerText}>
              Etkinlik açıklaması: {etkinlik.etkinlikAciklamasi}
            </Text>
            <Text style={Stil.pickerText}>Katılan Öteki Kullanıcılar: </Text>
            {etkinlik.katilimcilarKullaniciAdi.map(item => {
              return <Text style={Stil.pickerText}>{item} </Text>;
            })}
            <Pressable
              onPress={() => {
                basvuru(etkinlik);
              }}
              style={[Stil.button, {alignSelf: 'center'}]}>
              <Text>katıl</Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
};

const olusturdugumEtkinliklerEkrani = ({route, navigation}) => {
  const olusturulanEtkinlikler = route.params.olusturulanEtkinlikler;

  return (
    <ScrollView>
      {olusturulanEtkinlikler.map(etkinlik => {
        return (
          <View style={[Stil.searchArea, {paddingBottom: 20}]}>
            <Text style={Stil.pickerText}>
              Etkinlik Adı: {etkinlik.etkinlikAdi}
            </Text>
            <Text style={Stil.pickerText}>
              Gerçekleştiği Şehir: {etkinlik.sehir}
            </Text>
            <Text style={Stil.pickerText}>
              Etkinlik Türü: {etkinlik.etkinlikTuru}
            </Text>
            <Text style={Stil.pickerText}>Adres bilgisi: {etkinlik.adres}</Text>
            <Text style={Stil.pickerText}>
              Etkinlik açıklaması: {etkinlik.etkinlikAciklamasi}
            </Text>
            <Text style={Stil.pickerText}>Katılan Öteki Kullanıcılar: </Text>
            {etkinlik.katilimcilarKullaniciAdi.map(item => {
              return <Text style={Stil.pickerText}>{item} </Text>;
            })}
          </View>
        );
      })}
    </ScrollView>
  );
};

const katildigimEtkinliklerEkrani = ({route, navigation}) => {
  const katildigimEtkinlikler = route.params.katildigimEtkinlikler;

  return (
    <ScrollView>
      {katildigimEtkinlikler.map(etkinlik => {
        return (
          <View style={[Stil.searchArea, {paddingBottom: 20}]}>
            <Text style={Stil.pickerText}>
              Etkinlik Adı: {etkinlik.etkinlikAdi}
            </Text>
            <Text style={Stil.pickerText}>
              Gerçekleştiği Şehir: {etkinlik.sehir}
            </Text>
            <Text style={Stil.pickerText}>
              Etkinlik Türü: {etkinlik.etkinlikTuru}
            </Text>
            <Text style={Stil.pickerText}>Adres bilgisi: {etkinlik.adres}</Text>
            <Text style={Stil.pickerText}>
              Etkinlik açıklaması: {etkinlik.etkinlikAciklamasi}
            </Text>
            <Text style={Stil.pickerText}>Katılan Öteki Kullanıcılar: </Text>
            {etkinlik.katilimcilarKullaniciAdi.map(item => {
              return <Text style={Stil.pickerText}>{item} </Text>;
            })}
          </View>
        );
      })}
    </ScrollView>
  );
};

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="AnaEkran" component={AnaEkran} />
        <Stack.Screen name="KayitEkrani" component={KayitEkrani} />
        <Stack.Screen name="GirisEkrani" component={GirisEkrani} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="EklemeEkrani" component={EklemeEkrani} />
        <Stack.Screen
          name="aktiviteAramaSonucEkrani"
          component={aktiviteAramaSonucEkrani}
        />
        <Stack.Screen
          name="olusturdugumEtkinliklerEkrani"
          component={olusturdugumEtkinliklerEkrani}
        />
        <Stack.Screen
          name="katildigimEtkinliklerEkrani"
          component={katildigimEtkinliklerEkrani}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const Stil = StyleSheet.create({
  AnaEkranView: {
    flex: 1,
  },

  AnaEkranBaslik: {
    fontSize: 50,
    fontFamily: 'Lobster-Regular',
    color: '#00ADB5',
  },

  AnaEkranButon: {
    width: '50%',
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    margin: '5%',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#222831',
  },

  AnaEkranResim: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  KayitEkraniView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF',
  },

  KayitEkraniTextInput: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
    height: '8%',
    marginHorizontal: '7%',
    marginBottom: '10%',
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#222831',
  },

  KayitEkraniButon: {
    width: '50%',
    height: '7%',
    justifyContent: 'center',
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    margin: '5%',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#222831',
  },

  GirisEkraniTextInput: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    height: '10%',
    minHeight: '10%',
    marginHorizontal: '10%',
    marginBottom: '10%',
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#222831',
  },

  GirisEkraniButon: {
    width: '60%',
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#222831',
    margin: '7%',
  },

  KullaniciInputHeader: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222831',
    marginBottom: '2%',
    textAlign: 'left',
  },
  button: {
    width: '50%',
    height: '10%',
    backgroundColor: '#EEEEEE',
    margin: '5%',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#222831',
    alignItems: 'center',
  },
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: '10%',
  },
  RNPicker: {
    flex: 3,
    backgroundColor: '#EEEEEE',
    borderRadius: 10,
  },
  searchArea: {
    margin: 20,
    borderRadius: 10,
    backgroundColor: '#222831',
    paddingRight: '5%',
    paddingTop: '3%',
  },
  pickerText: {
    flex: 1,
    marginTop: '4%',
    marginLeft: '5%',
    color: '#EEEEEE',
    fontSize: 15,
  },
});
