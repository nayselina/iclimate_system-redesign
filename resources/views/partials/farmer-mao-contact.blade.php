{{-- Panel revision 4.4 C: the farmer's assigned MAO personnel, from the farmer's barangay (and sitio, when the MAO
     covers only part of it). "Your Agricultural Technologist: Lodivico A. Cachuela". The Municipal Agriculturist is named
     too, as the office head and the contact for barangays without assigned field personnel. --}}
@php
    $mcUser = $farmer ?? auth()->user();
    $mcBarangay = $mcUser?->registeredBarangay();
    $mcPeople = \App\Models\User::maoPersonnelFor($mcBarangay);
    $mcHead = \App\Models\User::maoHead();
    $mcFil = ($locale ?? app()->getLocale()) === 'fil';
@endphp
@if ($mcBarangay && ($mcPeople->isNotEmpty() || $mcHead))
    <section class="mao-contact" aria-labelledby="maoContactTitle" data-farmer-mao-contact>
        <h2 id="maoContactTitle" class="mao-contact-title">{{ $mcFil ? 'Ang inyong MAO personnel' : 'Your MAO personnel' }}</h2>
        <p class="mao-contact-note">{{ $mcFil ? 'Para sa Barangay' : 'For Barangay' }} {{ $mcBarangay }}</p>
        <ul class="mao-contact-list">
            @foreach ($mcPeople as $person)
                <li>
                    <span class="mao-contact-role">{{ $mcFil ? 'Ang inyong' : 'Your' }} {{ $person->positionLabel() }}:</span>
                    <strong>{{ $person->name }}</strong>
                    @if ($person->contact_number)<a class="mao-contact-phone" href="tel:{{ preg_replace('/[^0-9+]/', '', $person->contact_number) }}">{{ $person->contact_number }}</a>@endif
                </li>
            @endforeach
            @if ($mcHead)
                <li>
                    <span class="mao-contact-role">{{ $mcHead->positionLabel() }}:</span>
                    <strong>{{ $mcHead->name }}</strong>
                </li>
            @endif
        </ul>
        @if (\Illuminate\Support\Facades\Route::has('messages.index'))
            <a class="mfd-btn is-quiet mao-contact-btn" href="{{ route('messages.index') }}">{{ $mcFil ? 'Magpadala ng mensahe sa MAO' : 'Message the MAO' }}</a>
        @endif
    </section>
@endif
